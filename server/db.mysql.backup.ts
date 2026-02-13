import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, quoteSubmissions, InsertQuoteSubmission, quoteFiles, InsertQuoteFile, teamMembers, InsertTeamMember, portfolioItems, InsertPortfolioItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new quote submission
 */
export async function createQuoteSubmission(quote: InsertQuoteSubmission) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(quoteSubmissions).values(quote);
  return result[0].insertId;
}

/**
 * Get all quote submissions (for admin)
 */
export async function getAllQuoteSubmissions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(quoteSubmissions).orderBy(quoteSubmissions.createdAt);
}

/**
 * Get a single quote submission by ID
 */
export async function getQuoteSubmissionById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(quoteSubmissions).where(eq(quoteSubmissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Add a file to a quote submission
 */
export async function addQuoteFile(file: InsertQuoteFile) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(quoteFiles).values(file);
}

/**
 * Get all files for a quote submission
 */
export async function getQuoteFiles(quoteId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(quoteFiles).where(eq(quoteFiles.quoteId, quoteId));
}

/**
 * Update quote submission status
 */
export async function updateQuoteStatus(id: number, status: "new" | "reviewed" | "quoted" | "accepted" | "declined" | "completed") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(quoteSubmissions).set({ status }).where(eq(quoteSubmissions.id, id));
}

// ========================================
// Team Members
// ========================================

export async function createTeamMember(member: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(teamMembers).values(member);
  return result.insertId;
}

export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(teamMembers).orderBy(teamMembers.displayOrder);
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
  return member || null;
}

export async function updateTeamMember(id: number, updates: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(teamMembers).set(updates).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all portfolio items first
  await db.delete(portfolioItems).where(eq(portfolioItems.teamMemberId, id));
  // Then delete the team member
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ========================================
// Portfolio Items
// ========================================

export async function createPortfolioItem(item: InsertPortfolioItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(portfolioItems).values(item);
  return result.insertId;
}

export async function getPortfolioItemsByTeamMember(teamMemberId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(portfolioItems)
    .where(eq(portfolioItems.teamMemberId, teamMemberId))
    .orderBy(portfolioItems.displayOrder);
}

export async function getAllPortfolioItems() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(portfolioItems).orderBy(portfolioItems.displayOrder);
}

export async function updatePortfolioItem(id: number, updates: Partial<InsertPortfolioItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(portfolioItems).set(updates).where(eq(portfolioItems.id, id));
}

export async function deletePortfolioItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}


// ========================================
// Gallery Items
// ========================================

export async function getAllGalleryItems() {
  const db = await getDb();
  if (!db) return [];
  
  const { galleryItems } = await import("../drizzle/schema");
  return await db.select().from(galleryItems).orderBy(galleryItems.displayOrder, galleryItems.createdAt);
}

export async function getGalleryItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { galleryItems } = await import("../drizzle/schema");
  const [item] = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
  return item || null;
}
