import { ObjectId } from "mongodb";

export type ProjectDoc = {
  _id?: ObjectId;
  ownerUserId: string;
  name: string;
  createdAt: Date;
};

export type ApiKeyDoc = {
  _id?: ObjectId;
  projectId: ObjectId;
  label: string;
  keyHash: string;
  keyPreview: string;
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
};

export type EventDoc = {
  _id?: ObjectId;
  projectId: ObjectId;
  name: string;
  path?: string;
  url?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  visitorId?: string;
  occurredAt: Date;
  ip?: string;
  userAgent?: string;
  /** Server-parsed browser name from User-Agent */
  browser?: string;
  /** Server-parsed OS name from User-Agent */
  os?: string;
  /** Server-parsed device type from User-Agent */
  deviceType?: string;
  /** ISO 3166-1 alpha-2 country code from geo-IP */
  country?: string;
  /** City name from geo-IP */
  city?: string;
  /** Region/state from geo-IP */
  region?: string;
  createdAt: Date;
};

export type EventInput = {
  name: string;
  path?: string;
  url?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  visitorId?: string;
  occurredAt?: string;
};

export type DashboardSummary = {
  totalEvents: number;
  pageviews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  avgSessionDurationMs: number;
  bounceRate: number;
};

export type DashboardPoint = {
  day: string;
  events: number;
  pageviews: number;
};

export type TopPath = {
  path: string;
  views: number;
};

export type TopReferrer = {
  referrer: string;
  count: number;
};

export type BrowserBreakdown = {
  browser: string;
  count: number;
};

export type DeviceBreakdown = {
  deviceType: string;
  count: number;
};

export type OSBreakdown = {
  os: string;
  count: number;
};

export type CountryBreakdown = {
  country: string;
  count: number;
};

export type EventBreakdown = {
  name: string;
  count: number;
};

export type HourlyHeatmapPoint = {
  hour: number;
  count: number;
};

export type RecentEvent = {
  id: string;
  name: string;
  path?: string;
  metadata?: Record<string, unknown>;
  visitorId?: string;
  country?: string;
  occurredAt: Date;
};

export type DashboardData = {
  summary: DashboardSummary;
  timeline: DashboardPoint[];
  topPaths: TopPath[];
  topReferrers: TopReferrer[];
  browserBreakdown: BrowserBreakdown[];
  deviceBreakdown: DeviceBreakdown[];
  osBreakdown: OSBreakdown[];
  countryBreakdown: CountryBreakdown[];
  eventBreakdown: EventBreakdown[];
  hourlyHeatmap: HourlyHeatmapPoint[];
  recentEvents: RecentEvent[];
  liveVisitors: number;
};
