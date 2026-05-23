import { ObjectId } from "mongodb";
import { env } from "@/lib/env";
import { generateApiKey, hashApiKey, keyPreview } from "@/lib/crypto";
import { getDb } from "@/lib/mongodb";
import type {
  ApiKeyDoc,
  BrowserBreakdown,
  DashboardData,
  DashboardPoint,
  DashboardSummary,
  DeviceBreakdown,
  EventBreakdown,
  EventDoc,
  EventInput,
  HourlyHeatmapPoint,
  ProjectDoc,
  RecentEvent,
  TopPath,
  TopReferrer,
} from "@/lib/types";

let indexesEnsured = false;

async function ensureIndexes() {
  if (indexesEnsured) return;
  const db = await getDb();

  await Promise.all([
    db.collection<ProjectDoc>("projects").createIndex({ createdAt: -1 }),
    db.collection<ProjectDoc>("projects").createIndex({ ownerUserId: 1, createdAt: -1 }),
    db.collection<ApiKeyDoc>("api_keys").createIndex({ keyHash: 1 }, { unique: true }),
    db.collection<ApiKeyDoc>("api_keys").createIndex({ projectId: 1, createdAt: -1 }),
    db.collection<EventDoc>("events").createIndex({ projectId: 1, occurredAt: -1 }),
    db.collection<EventDoc>("events").createIndex({ projectId: 1, name: 1, occurredAt: -1 }),
    db.collection<EventDoc>("events").createIndex({ projectId: 1, "metadata.referrer": 1, occurredAt: -1 }),
    db.collection<EventDoc>("events").createIndex({ projectId: 1, visitorId: 1, sessionId: 1, occurredAt: -1 }),
  ]);

  indexesEnsured = true;
}


export async function createProject(name: string, ownerUserId: string) {
  await ensureIndexes();

  const db = await getDb();
  const now = new Date();

  const projectInsert = await db.collection<ProjectDoc>("projects").insertOne({
    ownerUserId,
    name,
    createdAt: now,
  });

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey, env.API_KEY_PEPPER);

  await db.collection<ApiKeyDoc>("api_keys").insertOne({
    projectId: projectInsert.insertedId,
    label: "Default",
    keyHash,
    keyPreview: keyPreview(rawKey),
    createdAt: now,
  });

  return {
    projectId: projectInsert.insertedId.toString(),
    apiKey: rawKey,
  };
}

export async function createAdditionalApiKey(projectId: string, label: string, ownerUserId: string) {
  await ensureIndexes();

  const db = await getDb();
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey, env.API_KEY_PEPPER);

  const ownedProject = await db.collection<ProjectDoc>("projects").findOne({
    _id: new ObjectId(projectId),
    ownerUserId,
  });

  if (!ownedProject?._id) {
    throw new Error("Project not found for this account.");
  }

  await db.collection<ApiKeyDoc>("api_keys").insertOne({
    projectId: ownedProject._id,
    label,
    keyHash,
    keyPreview: keyPreview(rawKey),
    createdAt: new Date(),
  });

  return rawKey;
}

export async function listProjects(ownerUserId: string) {
  await ensureIndexes();

  const db = await getDb();
  const projects = await db
    .collection<ProjectDoc>("projects")
    .find({ ownerUserId }, { sort: { createdAt: -1 } })
    .toArray();

  return projects.map((project) => ({
    id: project._id.toString(),
    name: project.name,
    createdAt: project.createdAt,
  }));
}

async function getOwnedProjectObjectId(projectId: string, ownerUserId: string) {
  const db = await getDb();
  const project = await db.collection<ProjectDoc>("projects").findOne({
    _id: new ObjectId(projectId),
    ownerUserId,
  });

  return project?._id ?? null;
}

export async function listProjectKeys(projectId: string, ownerUserId: string) {
  await ensureIndexes();

  const db = await getDb();
  const ownedProjectId = await getOwnedProjectObjectId(projectId, ownerUserId);

  if (!ownedProjectId) {
    return [];
  }

  const keys = await db
    .collection<ApiKeyDoc>("api_keys")
    .find({
      projectId: ownedProjectId,
      revokedAt: { $exists: false },
    })
    .sort({ createdAt: -1 })
    .toArray();

  return keys.map((key) => ({
    id: key._id.toString(),
    label: key.label,
    keyPreview: key.keyPreview,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
  }));
}

export async function resolveProjectByApiKey(rawApiKey: string) {
  await ensureIndexes();

  const db = await getDb();
  const keyHash = hashApiKey(rawApiKey, env.API_KEY_PEPPER);

  const key = await db.collection<ApiKeyDoc>("api_keys").findOne({
    keyHash,
    revokedAt: { $exists: false },
  });

  if (!key) return null;

  await db.collection<ApiKeyDoc>("api_keys").updateOne(
    { _id: key._id },
    {
      $set: {
        lastUsedAt: new Date(),
      },
    },
  );

  return {
    projectId: key.projectId,
    keyId: key._id,
  };
}


export async function ingestEvents(
  projectId: ObjectId,
  events: EventInput[],
  requestMeta: { ip?: string; userAgent?: string },
) {
  await ensureIndexes();

  const db = await getDb();
  const now = new Date();

  const documents: EventDoc[] = events.map((event) => {
    const occurredAt = event.occurredAt ? new Date(event.occurredAt) : now;

    return {
      projectId,
      name: event.name,
      path: event.path,
      url: event.url,
      referrer: event.referrer,
      metadata: event.metadata,
      sessionId: event.sessionId,
      visitorId: event.visitorId,
      occurredAt: Number.isNaN(occurredAt.getTime()) ? now : occurredAt,
      ip: requestMeta.ip,
      userAgent: requestMeta.userAgent,
      createdAt: now,
    };
  });

  if (documents.length === 0) return 0;

  const result = await db.collection<EventDoc>("events").insertMany(documents);
  return result.insertedCount;
}


export async function getDashboardData(projectId: string, ownerUserId: string, days = 14): Promise<DashboardData> {
  await ensureIndexes();

  const ownedProjectId = await getOwnedProjectObjectId(projectId, ownerUserId);

  const empty: DashboardData = {
    summary: { totalEvents: 0, pageviews: 0, uniqueVisitors: 0, uniqueSessions: 0, avgSessionDurationMs: 0, bounceRate: 0 },
    timeline: [],
    topPaths: [],
    topReferrers: [],
    browserBreakdown: [],
    deviceBreakdown: [],
    eventBreakdown: [],
    hourlyHeatmap: [],
    recentEvents: [],
    liveVisitors: 0,
  };

  if (!ownedProjectId) return empty;

  const db = await getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const liveThreshold = new Date(Date.now() - 5 * 60 * 1000);
  const baseMatch = { projectId: ownedProjectId, occurredAt: { $gte: since } };

  const [summaryRaw, timelineRaw, topPathsRaw, topReferrersRaw, browserRaw, deviceRaw, eventBreakdownRaw, hourlyRaw, recentRaw, liveRaw, sessionStatsRaw] = await Promise.all([
    // Summary
    db.collection<EventDoc>("events").aggregate<DashboardSummary & { _id: null }>([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          pageviews: { $sum: { $cond: [{ $eq: ["$name", "pageview"] }, 1, 0] } },
          uniqueVisitors: { $addToSet: "$visitorId" },
          uniqueSessions: { $addToSet: "$sessionId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          pageviews: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          uniqueSessions: { $size: "$uniqueSessions" },
        },
      },
    ]).toArray(),

    // Timeline
    db.collection<EventDoc>("events").aggregate<DashboardPoint & { _id: string }>([
      { $match: baseMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" } },
          events: { $sum: 1 },
          pageviews: { $sum: { $cond: [{ $eq: ["$name", "pageview"] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, day: "$_id", events: 1, pageviews: 1 } },
      { $sort: { day: 1 } },
    ]).toArray(),

    // Top paths
    db.collection<EventDoc>("events").aggregate<TopPath>([
      { $match: { ...baseMatch, name: "pageview", path: { $nin: [null, ""] } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $project: { _id: 0, path: "$_id", views: 1 } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]).toArray(),

    // Top referrers
    db.collection<EventDoc>("events").aggregate<TopReferrer>([
      { $match: { ...baseMatch, referrer: { $nin: [null, ""] } } },
      {
        $group: { _id: "$referrer", count: { $sum: 1 } },
      },
      { $project: { _id: 0, referrer: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),

    // Browser breakdown
    db.collection<EventDoc>("events").aggregate<BrowserBreakdown>([
      { $match: { ...baseMatch, "metadata.browser": { $exists: true } } },
      { $group: { _id: "$metadata.browser", count: { $sum: 1 } } },
      { $project: { _id: 0, browser: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]).toArray(),

    // Device breakdown
    db.collection<EventDoc>("events").aggregate<DeviceBreakdown>([
      { $match: { ...baseMatch, "metadata.deviceType": { $exists: true } } },
      { $group: { _id: "$metadata.deviceType", count: { $sum: 1 } } },
      { $project: { _id: 0, deviceType: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]).toArray(),

    // Event breakdown (excluding pageview and internal events)
    db.collection<EventDoc>("events").aggregate<EventBreakdown>([
      { $match: { ...baseMatch, name: { $nin: ["pageview", "identify", "group", "session_end", "web_vital"] } } },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]).toArray(),

    // Hourly heatmap
    db.collection<EventDoc>("events").aggregate<HourlyHeatmapPoint>([
      { $match: baseMatch },
      { $group: { _id: { $hour: "$occurredAt" }, count: { $sum: 1 } } },
      { $project: { _id: 0, hour: "$_id", count: 1 } },
      { $sort: { hour: 1 } },
    ]).toArray(),

    // Recent events
    db.collection<EventDoc>("events")
      .find({ projectId: ownedProjectId })
      .sort({ occurredAt: -1 })
      .limit(20)
      .toArray(),

    // Live visitors (last 5 min)
    db.collection<EventDoc>("events").aggregate<{ count: number }>([
      { $match: { projectId: ownedProjectId, occurredAt: { $gte: liveThreshold } } },
      { $group: { _id: "$visitorId" } },
      { $count: "count" },
    ]).toArray(),

    // Session duration stats (from session_end events)
    db.collection<EventDoc>("events").aggregate<{ avgDuration: number; totalSessions: number; bounceSessions: number }>([
      { $match: { ...baseMatch, name: "session_end" } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$metadata.durationMs" },
          totalSessions: { $sum: 1 },
        },
      },
    ]).toArray(),
  ]);

  // Calculate bounce rate from sessions with only 1 pageview
  const bounceRaw = await db.collection<EventDoc>("events").aggregate<{ bounceRate: number }>([
    { $match: { ...baseMatch, name: "pageview" } },
    { $group: { _id: "$sessionId", pageviews: { $sum: 1 } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        bounces: { $sum: { $cond: [{ $eq: ["$pageviews", 1] }, 1, 0] } },
      },
    },
    { $project: { _id: 0, bounceRate: { $cond: [{ $eq: ["$total", 0] }, 0, { $divide: ["$bounces", "$total"] }] } } },
  ]).toArray();

  const s = summaryRaw[0];
  const sessionStats = sessionStatsRaw[0];
  const bounce = bounceRaw[0];

  const summary: DashboardSummary = {
    totalEvents: s?.totalEvents ?? 0,
    pageviews: s?.pageviews ?? 0,
    uniqueVisitors: s?.uniqueVisitors ?? 0,
    uniqueSessions: s?.uniqueSessions ?? 0,
    avgSessionDurationMs: Math.round(sessionStats?.avgDuration ?? 0),
    bounceRate: Math.round((bounce?.bounceRate ?? 0) * 100),
  };

  const recentEvents: RecentEvent[] = recentRaw.map((e) => ({
    id: e._id!.toString(),
    name: e.name,
    path: e.path,
    metadata: e.metadata,
    visitorId: e.visitorId,
    occurredAt: e.occurredAt,
  }));

  return {
    summary,
    timeline: timelineRaw,
    topPaths: topPathsRaw,
    topReferrers: topReferrersRaw,
    browserBreakdown: browserRaw,
    deviceBreakdown: deviceRaw,
    eventBreakdown: eventBreakdownRaw,
    hourlyHeatmap: hourlyRaw,
    recentEvents,
    liveVisitors: liveRaw[0]?.count ?? 0,
  };
}
