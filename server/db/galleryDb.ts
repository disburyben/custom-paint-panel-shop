import { getDb } from "../db";
import {
  galleryItems,
  sprayers,
  type GalleryItem,
  type InsertGalleryItem,
  type Sprayer,
} from "../../drizzle/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";

/**
 * Gallery Database Operations
 * Enhanced with sprayer tagging and metadata
 */

/**
 * Gallery item with sprayer information
 */
export interface GalleryItemWithSprayer extends GalleryItem {
  sprayer?: Sprayer | null;
}

/**
 * Get all gallery items (admin view)
 */
export async function getAllGalleryItems(
  includeInactive: boolean = false
): Promise<GalleryItemWithSprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id));

  let results;
  if (includeInactive) {
    results = await query.orderBy(asc(galleryItems.displayOrder));
  } else {
    results = await query
      .where(eq(galleryItems.isActive, 1))
      .orderBy(asc(galleryItems.displayOrder));
  }

  return results.map((row) => ({
    ...row.galleryItem,
    sprayer: row.sprayer,
  }));
}

/**
 * Get active gallery items (public view)
 */
export async function getActiveGalleryItems(): Promise<GalleryItemWithSprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id))
    .where(eq(galleryItems.isActive, 1))
    .orderBy(asc(galleryItems.displayOrder));

  return results.map((row) => ({
    ...row.galleryItem,
    sprayer: row.sprayer,
  }));
}

/**
 * Get gallery items by category
 */
export async function getGalleryItemsByCategory(
  category: string,
  includeInactive: boolean = false
): Promise<GalleryItemWithSprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id));

  let results;
  if (includeInactive) {
    results = await query
      .where(eq(galleryItems.category, category))
      .orderBy(asc(galleryItems.displayOrder));
  } else {
    results = await query
      .where(
        and(
          eq(galleryItems.category, category),
          eq(galleryItems.isActive, 1)
        )
      )
      .orderBy(asc(galleryItems.displayOrder));
  }

  return results.map((row) => ({
    ...row.galleryItem,
    sprayer: row.sprayer,
  }));
}

/**
 * Get gallery items by sprayer
 */
export async function getGalleryItemsBySprayer(
  sprayerId: number,
  includeInactive: boolean = false
): Promise<GalleryItemWithSprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id));

  let results;
  if (includeInactive) {
    results = await query
      .where(eq(galleryItems.sprayerId, sprayerId))
      .orderBy(asc(galleryItems.displayOrder));
  } else {
    results = await query
      .where(
        and(
          eq(galleryItems.sprayerId, sprayerId),
          eq(galleryItems.isActive, 1)
        )
      )
      .orderBy(asc(galleryItems.displayOrder));
  }

  return results.map((row) => ({
    ...row.galleryItem,
    sprayer: row.sprayer,
  }));
}

/**
 * Get featured gallery items
 */
export async function getFeaturedGalleryItems(
  limit: number = 6
): Promise<GalleryItemWithSprayer[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id))
    .where(
      and(
        eq(galleryItems.isActive, 1),
        eq(galleryItems.isFeatured, 1)
      )
    )
    .orderBy(asc(galleryItems.displayOrder))
    .limit(limit);

  return results.map((row) => ({
    ...row.galleryItem,
    sprayer: row.sprayer,
  }));
}

/**
 * Get a single gallery item by ID
 */
export async function getGalleryItemById(
  id: number
): Promise<GalleryItemWithSprayer | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select({
      galleryItem: galleryItems,
      sprayer: sprayers,
    })
    .from(galleryItems)
    .leftJoin(sprayers, eq(galleryItems.sprayerId, sprayers.id))
    .where(eq(galleryItems.id, id))
    .limit(1);

  if (results.length === 0) return null;

  return {
    ...results[0].galleryItem,
    sprayer: results[0].sprayer,
  };
}

/**
 * Create a new gallery item
 */
export async function createGalleryItem(
  data: InsertGalleryItem
): Promise<GalleryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(galleryItems).values(data);
  const insertId = Number(result[0].insertId);

  const newItem = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, insertId))
    .limit(1);

  if (!newItem[0]) {
    throw new Error("Failed to retrieve newly created gallery item");
  }

  return newItem[0];
}

/**
 * Update an existing gallery item
 */
export async function updateGalleryItem(
  id: number,
  data: Partial<InsertGalleryItem>
): Promise<GalleryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(galleryItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(galleryItems.id, id));

  const updated = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  if (!updated[0]) {
    throw new Error("Gallery item not found after update");
  }

  return updated[0];
}

/**
 * Delete a gallery item by ID
 */
export async function deleteGalleryItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
}

/**
 * Toggle gallery item active status
 */
export async function toggleGalleryItemActive(id: number): Promise<GalleryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const item = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  if (!item[0]) {
    throw new Error("Gallery item not found");
  }

  const newStatus = item[0].isActive === 1 ? 0 : 1;
  return await updateGalleryItem(id, { isActive: newStatus });
}

/**
 * Toggle gallery item featured status
 */
export async function toggleGalleryItemFeatured(id: number): Promise<GalleryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const item = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  if (!item[0]) {
    throw new Error("Gallery item not found");
  }

  const newStatus = item[0].isFeatured === 1 ? 0 : 1;
  return await updateGalleryItem(id, { isFeatured: newStatus });
}

/**
 * Update gallery item display order
 */
export async function updateGalleryItemDisplayOrder(
  id: number,
  displayOrder: number
): Promise<GalleryItem> {
  return await updateGalleryItem(id, { displayOrder });
}
