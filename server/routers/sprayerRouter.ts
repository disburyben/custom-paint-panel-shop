import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "../_core/trpc";
import {
  getAllSprayers,
  getActiveSprayers,
  getSprayerById,
  createSprayer,
  updateSprayer,
  deleteSprayer,
  toggleSprayerActive,
  updateSprayerDisplayOrder,
} from "../db/sprayerDb";
import { storagePut } from "../storage";

/**
 * Sprayer Router
 * Handles sprayer (painter/technician) management
 */

export const sprayerRouter = router({
  /**
   * PUBLIC: Get all active sprayers
   */
  getActiveSprayers: publicProcedure.query(async () => {
    return await getActiveSprayers();
  }),

  /**
   * PUBLIC: Get sprayer by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getSprayerById(input.id);
    }),

  /**
   * ADMIN: Get all sprayers (including inactive)
   */
  getAllSprayers: adminProcedure.query(async () => {
    return await getAllSprayers();
  }),

  /**
   * ADMIN: Create a new sprayer
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        title: z.string().optional(),
        bio: z.string().optional(),
        certifications: z.string().optional(),
        logoKey: z.string().optional(),
        logoUrl: z.string().optional(),
        displayOrder: z.number().default(0),
        isActive: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      return await createSprayer(input);
    }),

  /**
   * ADMIN: Update an existing sprayer
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Name is required").optional(),
        title: z.string().optional(),
        bio: z.string().optional(),
        certifications: z.string().optional(),
        logoKey: z.string().optional(),
        logoUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateSprayer(id, data);
    }),

  /**
   * ADMIN: Delete a sprayer
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSprayer(input.id);
      return { success: true };
    }),

  /**
   * ADMIN: Toggle sprayer active status
   */
  toggleActive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await toggleSprayerActive(input.id);
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
      return await updateSprayerDisplayOrder(input.id, input.displayOrder);
    }),

  /**
   * ADMIN: Upload sprayer logo to S3
   */
  uploadLogo: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { fileName, fileData, mimeType } = input;

      // Decode base64 file data
      const buffer = Buffer.from(fileData, "base64");

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileKey = `sprayer-logos/${timestamp}-${randomSuffix}-${fileName}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, mimeType);

      return {
        fileKey,
        url,
      };
    }),
});
