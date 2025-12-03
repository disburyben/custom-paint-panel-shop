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
 * Quote submissions from the Get a Quote wizard
 */
export const quoteSubmissions = mysqlTable("quote_submissions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Customer Information
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Vehicle Information
  vehicleType: varchar("vehicleType", { length: 100 }).notNull(), // 'car', 'motorcycle', 'truck', 'suv'
  vehicleMake: varchar("vehicleMake", { length: 100 }),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  vehicleYear: varchar("vehicleYear", { length: 10 }),
  
  // Service Information
  serviceType: varchar("serviceType", { length: 100 }).notNull(), // 'custom-paint', 'restoration', 'collision-repair', 'detailing'
  paintFinish: varchar("paintFinish", { length: 100 }), // 'matte', 'gloss', 'satin', 'candy', 'pearl'
  
  // Additional Details
  description: text("description"),
  budget: varchar("budget", { length: 50 }),
  timeline: varchar("timeline", { length: 50 }),
  
  // Status
  status: mysqlEnum("status", ["new", "reviewed", "quoted", "accepted", "declined", "completed"]).default("new").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuoteSubmission = typeof quoteSubmissions.$inferSelect;
export type InsertQuoteSubmission = typeof quoteSubmissions.$inferInsert;

/**
 * Files uploaded with quote submissions (vehicle photos, reference images)
 */
export const quoteFiles = mysqlTable("quote_files", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  
  // S3 Storage Information
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key for the file
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(), // Public URL to access the file
  fileName: varchar("fileName", { length: 255 }).notNull(), // Original filename
  fileType: varchar("fileType", { length: 100 }), // MIME type (image/jpeg, image/png, etc.)
  fileSize: int("fileSize"), // File size in bytes
  
  // Metadata
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type QuoteFile = typeof quoteFiles.$inferSelect;
export type InsertQuoteFile = typeof quoteFiles.$inferInsert;