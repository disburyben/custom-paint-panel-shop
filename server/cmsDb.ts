import { getDb } from "./db";
import {
  testimonials,
  services,
  businessInfo,
  galleryItems,
  InsertTestimonial,
  InsertService,
  InsertBusinessInfo,
  InsertGalleryItem,
  Testimonial,
  Service,
  BusinessInfo,
  GalleryItem,
} from "../drizzle/schema";
import { eq, desc, and, asc } from "drizzle-orm";

const getDbInstance = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * TESTIMONIALS
 */

export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDbInstance();
  const result = await db.insert(testimonials).values(data);
  return result;
}

export async function updateTestimonial(
  id: number,
  data: Partial<InsertTestimonial>
) {
  const db = await getDbInstance();
  const result = await db
    .update(testimonials)
    .set(data)
    .where(eq(testimonials.id, id));
  return result;
}

export async function deleteTestimonial(id: number) {
  const db = await getDbInstance();
  const result = await db.delete(testimonials).where(eq(testimonials.id, id));
  return result;
}

export async function getTestimonialById(id: number): Promise<Testimonial | null> {
  const db = await getDbInstance();
  const result = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getAllTestimonials(
  approved: boolean = true
): Promise<Testimonial[]> {
  const db = await getDbInstance();
  const query = db.select().from(testimonials);

  if (approved) {
    return await query
      .where(eq(testimonials.isApproved, 1))
      .orderBy(asc(testimonials.displayOrder))
      .execute();
  }

  return await query.orderBy(desc(testimonials.createdAt)).execute();
}

export async function getFeaturedTestimonials(limit: number = 5): Promise<Testimonial[]> {
  const db = await getDbInstance();
  return await db
    .select()
    .from(testimonials)
    .where(
      and(
        eq(testimonials.isApproved, 1),
        eq(testimonials.isFeatured, 1)
      )
    )
    .orderBy(asc(testimonials.displayOrder))
    .limit(limit);
}

/**
 * SERVICES
 */

export async function createService(data: InsertService) {
  const db = await getDbInstance();
  const result = await db.insert(services).values(data);
  return result;
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDbInstance();
  const result = await db
    .update(services)
    .set(data)
    .where(eq(services.id, id));
  return result;
}

export async function deleteService(id: number) {
  const db = await getDbInstance();
  const result = await db.delete(services).where(eq(services.id, id));
  return result;
}

export async function getServiceById(id: number): Promise<Service | null> {
  const db = await getDbInstance();
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const db = await getDbInstance();
  const result = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getAllServices(active: boolean = true): Promise<Service[]> {
  const db = await getDbInstance();
  const query = db.select().from(services);

  if (active) {
    return await query
      .where(eq(services.isActive, 1))
      .orderBy(asc(services.displayOrder))
      .execute();
  }

  return await query.orderBy(asc(services.displayOrder)).execute();
}

/**
 * BUSINESS INFO
 */

export async function getBusinessInfo(): Promise<BusinessInfo | null> {
  const db = await getDbInstance();
  const result = await db.select().from(businessInfo).limit(1);
  return result[0] || null;
}

export async function updateBusinessInfo(data: Partial<InsertBusinessInfo>) {
  const db = await getDbInstance();
  const existing = await getBusinessInfo();

  if (existing) {
    const result = await db
      .update(businessInfo)
      .set(data)
      .where(eq(businessInfo.id, existing.id));
    return result;
  } else {
    // Create new record if it doesn't exist
    const result = await db.insert(businessInfo).values({
      ...data,
      businessName: data.businessName || "Caspers Paintworks",
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      businessHours: data.businessHours || "{}",
    } as InsertBusinessInfo);
    return result;
  }
}

/**
 * GALLERY ITEMS
 */

export async function createGalleryItem(data: InsertGalleryItem) {
  const db = await getDbInstance();
  const result = await db.insert(galleryItems).values(data);
  return result;
}

export async function updateGalleryItem(
  id: number,
  data: Partial<InsertGalleryItem>
) {
  const db = await getDbInstance();
  const result = await db
    .update(galleryItems)
    .set(data)
    .where(eq(galleryItems.id, id));
  return result;
}

export async function deleteGalleryItem(id: number) {
  const db = await getDbInstance();
  const result = await db.delete(galleryItems).where(eq(galleryItems.id, id));
  return result;
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  const db = await getDbInstance();
  const result = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getAllGalleryItems(
  active: boolean = true
): Promise<GalleryItem[]> {
  const db = await getDbInstance();
  const query = db.select().from(galleryItems);

  if (active) {
    return await query
      .where(eq(galleryItems.isActive, 1))
      .orderBy(asc(galleryItems.displayOrder))
      .execute();
  }

  return await query.orderBy(asc(galleryItems.displayOrder)).execute();
}

export async function getGalleryItemsByCategory(
  category: string,
  active: boolean = true
): Promise<GalleryItem[]> {
  const db = await getDbInstance();
  
  if (active) {
    return await db
      .select()
      .from(galleryItems)
      .where(
        and(
          eq(galleryItems.category, category),
          eq(galleryItems.isActive, 1)
        )
      )
      .orderBy(asc(galleryItems.displayOrder))
      .execute();
  }

  return await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.category, category))
    .orderBy(asc(galleryItems.displayOrder))
    .execute();
}

export async function getFeaturedGalleryItems(limit: number = 6): Promise<GalleryItem[]> {
  const db = await getDbInstance();
  return await db
    .select()
    .from(galleryItems)
    .where(
      and(
        eq(galleryItems.isActive, 1),
        eq(galleryItems.isFeatured, 1)
      )
    )
    .orderBy(asc(galleryItems.displayOrder))
    .limit(limit);
}
