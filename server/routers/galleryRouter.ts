import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "../_core/trpc";
import {
  getAllGalleryItems,
  getActiveGalleryItems,
  getGalleryItemsByCategory,
  getGalleryItemsBySprayer,
  getFeaturedGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemActive,
  toggleGalleryItemFeatured,
  updateGalleryItemDisplayOrder,
} from "../db/galleryDb";
import { storagePut } from "../storage";

/**
 * Gallery Router
 * Handles gallery item management with S3 image uploads and sprayer tagging
 */

export const galleryRouter = router({
  /**
   * PUBLIC: Get all active gallery items with sprayer info
   */
  getActiveItems: publicProcedure.query(async () => {
    return await getActiveGalleryItems();
  }),

  /**
   * PUBLIC: Get gallery items by category
   */
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getGalleryItemsByCategory(input.category, false);
    }),

  /**
   * PUBLIC: Get gallery items by sprayer
   */
  getBySprayer: publicProcedure
    .input(
      z.object({
        sprayerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getGalleryItemsBySprayer(input.sprayerId, false);
    }),

  /**
   * PUBLIC: Get featured gallery items
   */
  getFeatured: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getFeaturedGalleryItems(input?.limit);
    }),

  /**
   * PUBLIC: Get gallery item by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getGalleryItemById(input.id);
    }),

  /**
   * ADMIN: Get all gallery items (including inactive)
   */
  getAllItems: adminProcedure
    .input(
      z
        .object({
          includeInactive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getAllGalleryItems(input?.includeInactive ?? true);
    }),

  /**
   * ADMIN: Upload image to S3
   */
  uploadImage: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string(),
        imageType: z.enum(["before", "after"]), // Specify which type of image
      })
    )
    .mutation(async ({ input }) => {
      const { fileName, fileData, mimeType, imageType } = input;

      // Decode base64 file data
      const buffer = Buffer.from(fileData, "base64");

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileKey = `gallery/${imageType}/${timestamp}-${randomSuffix}-${fileName}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, mimeType);

      return {
        fileKey,
        url,
      };
    }),

  /**
   * ADMIN: Create a new gallery item
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        category: z.string().min(1, "Category is required"),
        vehicleType: z.string().optional(),
        servicesProvided: z.string().optional(),
        sprayerId: z.number().optional(),
        beforeImageKey: z.string().min(1, "Before image is required"),
        beforeImageUrl: z.string().min(1, "Before image URL is required"),
        afterImageKey: z.string().min(1, "After image is required"),
        afterImageUrl: z.string().min(1, "After image URL is required"),
        displayOrder: z.number().default(0),
        isFeatured: z.number().default(0),
        isActive: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      return await createGalleryItem(input);
    }),

  /**
   * ADMIN: Update an existing gallery item
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        vehicleType: z.string().optional(),
        servicesProvided: z.string().optional(),
        sprayerId: z.number().optional().nullable(),
        beforeImageKey: z.string().optional(),
        beforeImageUrl: z.string().optional(),
        afterImageKey: z.string().optional(),
        afterImageUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        isFeatured: z.number().optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateGalleryItem(id, data);
    }),

  /**
   * ADMIN: Delete a gallery item
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGalleryItem(input.id);
      return { success: true };
    }),

  /**
   * ADMIN: Toggle gallery item active status
   */
  toggleActive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await toggleGalleryItemActive(input.id);
    }),

  /**
   * ADMIN: Toggle gallery item featured status
   */
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await toggleGalleryItemFeatured(input.id);
    }),

  /**
   * ADMIN: Update display order
   */
  updateDisplayOrder: adminProcedure
    .input(
      z.object({
        id: z.number(),
        displayOrder: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateGalleryItemDisplayOrder(
        input.id,
        input.displayOrder
      );
    }),
});
