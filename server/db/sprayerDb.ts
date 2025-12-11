import { getDb } from "../db";
import { sprayers, type Sprayer, type InsertSprayer } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Sprayer Database Operations
 * CRUD functions for managing sprayers (painters/technicians)
 */

/**
 * Get all sprayers, ordered by displayOrder
 */
export async function getAllSprayers(): Promise<Sprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(sprayers)
    .orderBy(sprayers.displayOrder, desc(sprayers.createdAt));
}

/**
 * Get all active sprayers only
 */
export async function getActiveSprayers(): Promise<Sprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(sprayers)
    .where(eq(sprayers.isActive, 1))
    .orderBy(sprayers.displayOrder, desc(sprayers.createdAt));
}

/**
 * Get a single sprayer by ID
 */
export async function getSprayerById(id: number): Promise<Sprayer | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(sprayers)
    .where(eq(sprayers.id, id))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create a new sprayer
 */
export async function createSprayer(data: InsertSprayer): Promise<Sprayer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sprayers).values(data);
  const insertId = Number(result[0].insertId);
  
  const newSprayer = await getSprayerById(insertId);
  if (!newSprayer) {
    throw new Error("Failed to retrieve newly created sprayer");
  }
  
  return newSprayer;
}

/**
 * Update an existing sprayer
 */
export async function updateSprayer(
  id: number,
  data: Partial<InsertSprayer>
): Promise<Sprayer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(sprayers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(sprayers.id, id));
  
  const updated = await getSprayerById(id);
  if (!updated) {
    throw new Error("Sprayer not found after update");
  }
  
  return updated;
}

/**
 * Delete a sprayer by ID
 */
export async function deleteSprayer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(sprayers).where(eq(sprayers.id, id));
}

/**
 * Toggle sprayer active status
 */
export async function toggleSprayerActive(id: number): Promise<Sprayer> {
  const sprayer = await getSprayerById(id);
  if (!sprayer) {
    throw new Error("Sprayer not found");
  }
  
  const newStatus = sprayer.isActive === 1 ? 0 : 1;
  return await updateSprayer(id, { isActive: newStatus });
}

/**
 * Update sprayer display order
 */
export async function updateSprayerDisplayOrder(
  id: number,
  displayOrder: number
): Promise<Sprayer> {
  return await updateSprayer(id, { displayOrder });
}
