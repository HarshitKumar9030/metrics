import { ObjectId } from "mongodb";
import { env } from "@/lib/env";
import { generateApiKey, hashApiKey, keyPreview } from "@/lib/crypto";
import { getDb } from "@/lib/mongodb";
import type {
  ApiKeyDoc,
  DashboardPoint,
  DashboardSummary,
  EventDoc,
  EventInput,
  ProjectDoc,
  TopPath,
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

export async function getDashboardData(projectId: string, ownerUserId: string, days = 14) {
  await ensureIndexes();

  const ownedProjectId = await getOwnedProjectObjectId(projectId, ownerUserId);

  if (!ownedProjectId) {
    return {
      summary: {
        totalEvents: 0,
        pageviews: 0,
        uniqueVisitors: 0,
      },
      timeline: [],
      topPaths: [],
    };
  }

  const db = await getDb();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [summaryRaw, timelineRaw, topPathsRaw] = await Promise.all([
    db
      .collection<EventDoc>("events")
      .aggregate<DashboardSummary & { _id: null }>([
        {
          $match: {
            projectId: ownedProjectId,
            occurredAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            pageviews: {
              $sum: {
                $cond: [{ $eq: ["$name", "pageview"] }, 1, 0],
              },
            },
            uniqueVisitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 0,
            totalEvents: 1,
            pageviews: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
          },
        },
      ])
      .toArray(),
    db
      .collection<EventDoc>("events")
      .aggregate<DashboardPoint & { _id: string }>([
        {
          $match: {
            projectId: ownedProjectId,
            occurredAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$occurredAt",
              },
            },
            events: { $sum: 1 },
            pageviews: {
              $sum: {
                $cond: [{ $eq: ["$name", "pageview"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            day: "$_id",
            events: 1,
            pageviews: 1,
          },
        },
        { $sort: { day: 1 } },
      ])
      .toArray(),
    db
      .collection<EventDoc>("events")
      .aggregate<TopPath>([
        {
          $match: {
            projectId: ownedProjectId,
            name: "pageview",
            occurredAt: { $gte: since },
            path: { $nin: [null, ""] },
          },
        },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            path: "$_id",
            views: 1,
          },
        },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ])
      .toArray(),
  ]);

  const summary = summaryRaw[0] ?? {
    totalEvents: 0,
    pageviews: 0,
    uniqueVisitors: 0,
  };

  return {
    summary,
    timeline: timelineRaw,
    topPaths: topPathsRaw,
  };
}
