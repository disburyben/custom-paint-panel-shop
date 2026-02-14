import { getDb } from "./db";
import {
  products,
  productVariants,
  cartItems,
  orders,
  orderItems,
  giftCertificates,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type GiftCertificate,
  type InsertGiftCertificate
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * PRODUCTS
 */

export async function getAllProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products).orderBy(desc(products.displayOrder), desc(products.createdAt));
}

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(products)
    .where(eq(products.isActive, 1))
    .orderBy(desc(products.displayOrder), desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] || null;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated variants first
  await db.delete(productVariants).where(eq(productVariants.productId, id));
  // Delete product
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

/**
 * PRODUCT VARIANTS
 */

export async function getProductVariants(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(productVariants.size, productVariants.color);
}

export async function getVariantById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return result[0] || null;
}

export async function createVariant(data: InsertProductVariant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productVariants).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateVariant(id: number, data: Partial<InsertProductVariant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productVariants).set(data).where(eq(productVariants.id, id));
  return { success: true };
}

export async function deleteVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productVariants).where(eq(productVariants.id, id));
  return { success: true };
}

/**
 * SHOPPING CART
 */

export async function getCartItems(userId: number | null, sessionId: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (userId) {
    conditions.push(eq(cartItems.userId, userId));
  } else if (sessionId) {
    conditions.push(eq(cartItems.sessionId, sessionId));
  } else {
    return [];
  }

  return await db.select().from(cartItems)
    .where(and(...conditions))
    .orderBy(desc(cartItems.createdAt));
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if item already exists in cart
  const conditions = [];
  if (data.userId) {
    conditions.push(eq(cartItems.userId, data.userId));
  } else if (data.sessionId) {
    conditions.push(eq(cartItems.sessionId, data.sessionId));
  }
  conditions.push(eq(cartItems.productId, data.productId));
  if (data.variantId) {
    conditions.push(eq(cartItems.variantId, data.variantId));
  }

  const existing = await db.select().from(cartItems)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + (data.quantity || 1) })
      .where(eq(cartItems.id, existing[0].id));
    return { id: existing[0].id };
  } else {
    // Insert new item
    const result = await db.insert(cartItems).values(data);
    return { id: Number(result[0].insertId) };
  }
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
  return { success: true };
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, id));
  return { success: true };
}

export async function clearCart(userId: number | null, sessionId: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (userId) {
    conditions.push(eq(cartItems.userId, userId));
  } else if (sessionId) {
    conditions.push(eq(cartItems.sessionId, sessionId));
  }

  if (conditions.length > 0) {
    await db.delete(cartItems).where(and(...conditions));
  }
  return { success: true };
}

/**
 * ORDERS
 */

export async function getAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] || null;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0] || null;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
  return { success: true };
}

/**
 * ORDER ITEMS
 */

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(data);
  return { id: Number(result[0].insertId) };
}

/**
 * GIFT CERTIFICATES
 */

export async function getAllGiftCertificates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(giftCertificates).orderBy(desc(giftCertificates.createdAt));
}

export async function getGiftCertificateByCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(giftCertificates)
    .where(eq(giftCertificates.code, code.toUpperCase()))
    .limit(1);
  return result[0] || null;
}

export async function createGiftCertificate(data: InsertGiftCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(giftCertificates).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateGiftCertificate(id: number, data: Partial<InsertGiftCertificate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(giftCertificates).set(data).where(eq(giftCertificates.id, id));
  return { success: true };
}

/**
 * UTILITY FUNCTIONS
 */

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

export function generateGiftCertificateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  let code = 'GIFT-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
