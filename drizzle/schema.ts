import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Usage tracking table for rate limiting.
 * Tracks each script generation request per user.
 */
export const usageRecords = mysqlTable("usageRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Type of operation: 'generate_script' */
  operationType: varchar("operationType", { length: 50 }).notNull(),
  /** Search keyword used */
  keyword: text("keyword"),
  /** Target market */
  targetMarket: varchar("targetMarket", { length: 50 }),
  /** Timestamp of the request */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageRecord = typeof usageRecords.$inferSelect;
export type InsertUsageRecord = typeof usageRecords.$inferInsert;

/**
 * Video playback tracking table.
 * Tracks which customer type videos users watch.
 */
export const videoPlaybacks = mysqlTable("videoPlaybacks", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (negative for guests using browser fingerprint) */
  userId: int("userId").notNull(),
  /** Video identifier: 'ecommerce', 'creators', 'kols' */
  videoType: varchar("videoType", { length: 50 }).notNull(),
  /** Play duration in seconds */
  duration: int("duration"),
  /** Whether the video was played to completion */
  completed: int("completed").default(0).notNull(),
  /** Timestamp of the playback */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoPlayback = typeof videoPlaybacks.$inferSelect;
export type InsertVideoPlayback = typeof videoPlaybacks.$inferInsert;

/**
 * Traffic source tracking table.
 * Tracks where visitors come from (search engines, social media, direct, referrals, etc.)
 */
export const trafficSources = mysqlTable("trafficSources", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (negative for guests using browser fingerprint) */
  userId: int("userId").notNull(),
  /** Source type: 'direct', 'search', 'social', 'referral', 'campaign' */
  sourceType: varchar("sourceType", { length: 50 }).notNull(),
  /** Referrer URL (where the visitor came from) */
  referrer: text("referrer"),
  /** UTM source parameter */
  utmSource: varchar("utmSource", { length: 100 }),
  /** UTM medium parameter */
  utmMedium: varchar("utmMedium", { length: 100 }),
  /** UTM campaign parameter */
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  /** Landing page URL */
  landingPage: text("landingPage"),
  /** User agent string */
  userAgent: text("userAgent"),
  /** Timestamp of the visit */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrafficSource = typeof trafficSources.$inferSelect;
export type InsertTrafficSource = typeof trafficSources.$inferInsert;

/**
 * API usage logs table.
 * Tracks every GLM-4 API call with token consumption details.
 */
export const apiLogs = mysqlTable("apiLogs", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID who made the API call (null for system calls) */
  userId: int("userId"),
  /** API endpoint or operation type (e.g., 'generate_script', 'chat_completion') */
  operation: varchar("operation", { length: 100 }).notNull(),
  /** Model used (e.g., 'glm-4-flash') */
  model: varchar("model", { length: 50 }),
  /** Input prompt or request summary */
  promptSummary: text("promptSummary"),
  /** Number of tokens in the prompt */
  promptTokens: int("promptTokens"),
  /** Number of tokens in the completion */
  completionTokens: int("completionTokens"),
  /** Total tokens used (prompt + completion) */
  totalTokens: int("totalTokens"),
  /** Response time in milliseconds */
  responseTime: int("responseTime"),
  /** Success status */
  success: int("success").default(1).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Timestamp of the API call */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = typeof apiLogs.$inferInsert;
