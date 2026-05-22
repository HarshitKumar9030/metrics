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
