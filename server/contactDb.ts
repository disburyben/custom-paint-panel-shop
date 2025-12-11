import { getDb } from "./db";
import { contactSubmissions, type InsertContactSubmission, type ContactSubmission } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactSubmissions).values(data);
  const id = result[0].insertId;
  
  const submission = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, Number(id))).limit(1);
  return submission[0];
}

export async function getContactSubmissions(limit: number = 50, offset: number = 0): Promise<ContactSubmission[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset);
}

export async function getContactSubmissionById(id: number): Promise<ContactSubmission | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
  return result[0];
}

export async function updateContactSubmissionStatus(id: number, status: "new" | "read" | "replied"): Promise<ContactSubmission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactSubmissions).set({ status }).where(eq(contactSubmissions.id, id));
  
  const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
  return result[0];
}

export async function deleteContactSubmission(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
}

export async function getContactSubmissionCount(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({ count: contactSubmissions.id }).from(contactSubmissions);
  return result.length;
}

export async function getUnreadContactSubmissions(): Promise<ContactSubmission[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contactSubmissions).where(eq(contactSubmissions.status, "new")).orderBy(desc(contactSubmissions.createdAt));
}
