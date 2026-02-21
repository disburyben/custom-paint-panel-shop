import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Quote submissions from the Get a Quote wizard
 */
export const quoteStatusEnum = pgEnum("quote_status", ["new", "reviewed", "quoted", "accepted", "declined", "completed"]);

export const quoteSubmissions = pgTable("quote_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  vehicleType: varchar("vehicleType", { length: 100 }).notNull(),
  vehicleMake: varchar("vehicleMake", { length: 100 }),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  vehicleYear: varchar("vehicleYear", { length: 10 }),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  paintFinish: varchar("paintFinish", { length: 100 }),
  description: text("description"),
  budget: varchar("budget", { length: 50 }),
  timeline: varchar("timeline", { length: 50 }),
  status: quoteStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type QuoteSubmission = typeof quoteSubmissions.$inferSelect;
export type InsertQuoteSubmission = typeof quoteSubmissions.$inferInsert;

/**
 * Files uploaded with quote submissions
 */
export const quoteFiles = pgTable("quote_files", {
  id: serial("id").primaryKey(),
  quoteId: integer("quoteId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: integer("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type QuoteFile = typeof quoteFiles.$inferSelect;
export type InsertQuoteFile = typeof quoteFiles.$inferInsert;

/**
 * Team members
 */
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  bio: text("bio"),
  specialty: varchar("specialty", { length: 255 }),
  headshotKey: varchar("headshotKey", { length: 500 }),
  headshotUrl: varchar("headshotUrl", { length: 1000 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Portfolio items for each team member
 */
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("teamMemberId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  imageKey: varchar("imageKey", { length: 500 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 1000 }).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isFeatured: integer("isFeatured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Products
 */
export const productTypeEnum = pgEnum("product_type", ["merchandise", "gift_certificate"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  type: productTypeEnum("type").notNull(),
  basePrice: integer("basePrice").notNull(),
  compareAtPrice: integer("compareAtPrice"),
  trackInventory: integer("trackInventory").default(1).notNull(),
  inventoryQuantity: integer("inventoryQuantity").default(0),
  allowBackorder: integer("allowBackorder").default(0).notNull(),
  category: varchar("category", { length: 100 }),
  images: text("images"),
  hasVariants: integer("hasVariants").default(0).notNull(),
  featured: integer("featured").default(0).notNull(),
  displayOrder: integer("displayOrder").default(0),
  isActive: integer("isActive").default(1).notNull(),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Variants
 */
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
  price: integer("price").notNull(),
  inventoryQuantity: integer("inventoryQuantity").default(0),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

/**
 * Shopping Cart
 */
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  sessionId: varchar("sessionId", { length: 255 }),
  productId: integer("productId").notNull(),
  variantId: integer("variantId"),
  quantity: integer("quantity").default(1).notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders
 */
export const orderPaymentStatusEnum = pgEnum("order_payment_status", ["pending", "paid", "failed", "refunded"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: integer("userId"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  shippingAddress: text("shippingAddress").notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingCost: integer("shippingCost").default(0).notNull(),
  tax: integer("tax").default(0).notNull(),
  discount: integer("discount").default(0),
  total: integer("total").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  paymentStatus: orderPaymentStatusEnum("paymentStatus").default("pending").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  shippingCarrier: varchar("shippingCarrier", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  variantId: integer("variantId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  variantName: varchar("variantName", { length: 255 }),
  productImage: varchar("productImage", { length: 500 }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Gift Certificates
 */
export const giftCertStatusEnum = pgEnum("gift_cert_status", ["active", "redeemed", "expired", "cancelled"]);

export const giftCertificates = pgTable("gift_certificates", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  orderId: integer("orderId"),
  orderItemId: integer("orderItemId"),
  amount: integer("amount").notNull(),
  balance: integer("balance").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientName: varchar("recipientName", { length: 255 }),
  message: text("message"),
  status: giftCertStatusEnum("status").default("active").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  redeemedAt: timestamp("redeemedAt"),
});

export type GiftCertificate = typeof giftCertificates.$inferSelect;
export type InsertGiftCertificate = typeof giftCertificates.$inferInsert;

/**
 * Blog Posts
 */
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImageKey: varchar("featuredImageKey", { length: 500 }),
  featuredImageUrl: varchar("featuredImageUrl", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  isPublished: integer("isPublished").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isFeatured: integer("isFeatured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Testimonials
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerTitle: varchar("customerTitle", { length: 255 }),
  customerImage: varchar("customerImage", { length: 1000 }),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5).notNull(),
  isApproved: integer("isApproved").default(0).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isFeatured: integer("isFeatured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Services
 */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  startingPrice: integer("startingPrice"),
  priceDescription: varchar("priceDescription", { length: 255 }),
  features: text("features"),
  turnaroundTime: varchar("turnaroundTime", { length: 255 }),
  iconKey: varchar("iconKey", { length: 500 }),
  iconUrl: varchar("iconUrl", { length: 1000 }),
  imageKey: varchar("imageKey", { length: 500 }),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Business Information
 */
export const businessInfo = pgTable("business_info", {
  id: serial("id").primaryKey(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: text("address").notNull(),
  businessHours: text("businessHours").notNull(),
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  youtube: varchar("youtube", { length: 255 }),
  aboutText: text("aboutText"),
  mission: text("mission"),
  yearsInBusiness: integer("yearsInBusiness"),
  projectsCompleted: integer("projectsCompleted"),
  satisfactionRate: integer("satisfactionRate"),
  logoUrl: varchar("logoUrl", { length: 1000 }),
  heroImageUrl: varchar("heroImageUrl", { length: 1000 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BusinessInfo = typeof businessInfo.$inferSelect;
export type InsertBusinessInfo = typeof businessInfo.$inferInsert;

/**
 * Gallery Items
 */
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  images: text("images").notNull().default("[]"),          // JSON array of URL strings
  coverImageUrl: varchar("coverImageUrl", { length: 1000 }), // first image shown as thumbnail
  displayOrder: integer("displayOrder").default(0).notNull(),
  isFeatured: integer("isFeatured").default(0).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;
