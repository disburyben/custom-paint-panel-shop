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

/**
 * Team members (owner and employees) for gallery showcase
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  
  // Profile Information
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Master Painter", "Restoration Specialist"
  bio: text("bio"), // Short bio about the team member
  specialty: varchar("specialty", { length: 255 }), // e.g., "Custom Candy Finishes", "Classic Car Restoration"
  
  // Headshot Image
  headshotKey: varchar("headshotKey", { length: 500 }), // S3 key for headshot
  headshotUrl: varchar("headshotUrl", { length: 1000 }), // Public URL for headshot
  
  // Display Settings
  displayOrder: int("displayOrder").default(0).notNull(), // Order to display on gallery page
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = hidden
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Portfolio items for each team member (their individual work)
 */
export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  teamMemberId: int("teamMemberId").notNull(), // Foreign key to team_members
  
  // Project Information
  title: varchar("title", { length: 255 }).notNull(), // e.g., "1967 Mustang Candy Apple Red"
  description: text("description"), // Details about the project
  category: varchar("category", { length: 100 }), // e.g., "Custom Paint", "Restoration", "Collision Repair"
  
  // Image Information
  imageKey: varchar("imageKey", { length: 500 }).notNull(), // S3 key for portfolio image
  imageUrl: varchar("imageUrl", { length: 1000 }).notNull(), // Public URL for image
  
  // Display Settings
  displayOrder: int("displayOrder").default(0).notNull(),
  isFeatured: int("isFeatured").default(0).notNull(), // 1 = featured, 0 = normal
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;
/**
 * E-COMMERCE TABLES
 */

/**
 * Products - Merchandise and Gift Certificates
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  type: mysqlEnum("type", ["merchandise", "gift_certificate"]).notNull(),
  
  // Pricing
  basePrice: int("basePrice").notNull(), // Price in cents
  compareAtPrice: int("compareAtPrice"), // Original price for sale items
  
  // Inventory
  trackInventory: int("trackInventory").default(1).notNull(), // Boolean: 1 = track, 0 = don't track
  inventoryQuantity: int("inventoryQuantity").default(0),
  allowBackorder: int("allowBackorder").default(0).notNull(),
  
  // Product Details
  category: varchar("category", { length: 100 }), // 'apparel', 'accessories', 'gift_certificate'
  images: text("images"), // JSON array of image URLs
  
  // Variants Support
  hasVariants: int("hasVariants").default(0).notNull(), // Boolean: 1 = has variants, 0 = simple product
  
  // SEO & Display
  featured: int("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0),
  isActive: int("isActive").default(1).notNull(),
  
  // Metadata
  stripeProductId: varchar("stripeProductId", { length: 255 }), // Stripe Product ID
  stripePriceId: varchar("stripePriceId", { length: 255 }), // Stripe Price ID for simple products
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Variants - For products with size/color options
 */
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  
  // Variant Options
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Large / Black"
  sku: varchar("sku", { length: 100 }).unique(),
  size: varchar("size", { length: 50 }), // S, M, L, XL, 2XL
  color: varchar("color", { length: 50 }), // Black, White, Grey, Orange
  
  // Pricing & Inventory
  price: int("price").notNull(), // Price in cents (can differ from base product)
  inventoryQuantity: int("inventoryQuantity").default(0),
  
  // Stripe Integration
  stripePriceId: varchar("stripePriceId", { length: 255 }), // Stripe Price ID for this variant
  
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

/**
 * Shopping Cart
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // NULL for guest carts
  sessionId: varchar("sessionId", { length: 255 }), // For guest users
  
  productId: int("productId").notNull(),
  variantId: int("variantId"), // NULL if simple product
  
  quantity: int("quantity").default(1).notNull(),
  price: int("price").notNull(), // Price at time of adding to cart (cents)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(), // e.g., "ORD-20231215-001"
  
  // Customer Info
  userId: int("userId"), // NULL for guest checkout
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  
  // Shipping Address
  shippingAddress: text("shippingAddress").notNull(), // JSON object
  
  // Order Totals (all in cents)
  subtotal: int("subtotal").notNull(),
  shippingCost: int("shippingCost").default(0).notNull(),
  tax: int("tax").default(0).notNull(),
  discount: int("discount").default(0),
  total: int("total").notNull(),
  
  // Payment
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  
  // Fulfillment
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  shippingCarrier: varchar("shippingCarrier", { length: 100 }),
  
  // Metadata
  notes: text("notes"), // Internal admin notes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  
  productId: int("productId").notNull(),
  variantId: int("variantId"), // NULL if simple product
  
  // Snapshot of product at time of purchase
  productName: varchar("productName", { length: 255 }).notNull(),
  variantName: varchar("variantName", { length: 255 }), // e.g., "Large / Black"
  productImage: varchar("productImage", { length: 500 }),
  
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // Price per item in cents
  total: int("total").notNull(), // quantity * price
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Gift Certificate Codes
 */
export const giftCertificates = mysqlTable("gift_certificates", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "GIFT-ABC123"
  
  orderId: int("orderId"), // Order that purchased this certificate
  orderItemId: int("orderItemId"),
  
  amount: int("amount").notNull(), // Value in cents
  balance: int("balance").notNull(), // Remaining balance in cents
  
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientName: varchar("recipientName", { length: 255 }),
  message: text("message"),
  
  status: mysqlEnum("status", ["active", "redeemed", "expired", "cancelled"]).default("active").notNull(),
  
  expiresAt: timestamp("expiresAt"), // NULL = no expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  redeemedAt: timestamp("redeemedAt"),
});

export type GiftCertificate = typeof giftCertificates.$inferSelect;
export type InsertGiftCertificate = typeof giftCertificates.$inferInsert;
