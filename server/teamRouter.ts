import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { adminSessionProcedure } from "./adminAuth";
import * as db from "./db";
import { storagePut } from "./storage";

export const teamRouter = router({
  // Public: Get all active team members
  list: publicProcedure.query(async () => {
    const members = await db.getAllTeamMembers();
    return members.filter(m => m.isActive === 1);
  }),

  // Public: Get team member with their portfolio
  getWithPortfolio: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const member = await db.getTeamMemberById(input.id);
      if (!member) throw new Error("Team member not found");
      
      const portfolio = await db.getPortfolioItemsByTeamMember(input.id);
      
      return {
        member,
        portfolio,
      };
    }),

  // Admin: Get all team members (including inactive)
  adminList: adminSessionProcedure.query(async () => {
    return await db.getAllTeamMembers();
  }),

  // Admin: Create team member
  create: adminSessionProcedure
    .input(z.object({
      name: z.string().min(1),
      title: z.string().min(1),
      bio: z.string().optional(),
      specialty: z.string().optional(),
      displayOrder: z.number().default(0),
    }))
    .mutation(async ({ input }: { input: { name: string; title: string; bio?: string; specialty?: string; displayOrder: number } }) => {
      const id = await db.createTeamMember({
        ...input,
        isActive: 1,
      });
      return { id };
    }),

  // Admin: Update team member
  update: adminSessionProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      bio: z.string().optional(),
      specialty: z.string().optional(),
      displayOrder: z.number().optional(),
      isActive: z.number().optional(),
    }))
    .mutation(async ({ input }: { input: { id: number; name?: string; title?: string; bio?: string; specialty?: string; displayOrder?: number; isActive?: number } }) => {
      const { id, ...updates } = input;
      await db.updateTeamMember(id, updates);
      return { success: true };
    }),

  // Admin: Upload headshot
  uploadHeadshot: adminSessionProcedure
    .input(z.object({
      id: z.number(),
      imageData: z.string(), // base64 encoded image
      fileName: z.string(),
    }))
    .mutation(async ({ input }: { input: { id: number; imageData: string; fileName: string } }) => {
      // Decode base64 image
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Upload to S3
      const key = `team-headshots/${input.id}/${Date.now()}-${input.fileName}`;
      const result = await storagePut(key, buffer, "image/jpeg");
      
      // Update team member with headshot URL
      await db.updateTeamMember(input.id, {
        headshotKey: result.key,
        headshotUrl: result.url,
      });
      
      return result;
    }),

  // Admin: Delete team member
  delete: adminSessionProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      await db.deleteTeamMember(input.id);
      return { success: true };
    }),

  // Admin: Create portfolio item
  createPortfolioItem: adminSessionProcedure
    .input(z.object({
      teamMemberId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      imageData: z.string(), // base64 encoded image
      fileName: z.string(),
      displayOrder: z.number().default(0),
      isFeatured: z.number().default(0),
    }))
    .mutation(async ({ input }: { input: { teamMemberId: number; title: string; description?: string; category?: string; imageData: string; fileName: string; displayOrder: number; isFeatured: number } }) => {
      // Decode base64 image
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      // Upload to S3
      const key = `portfolio/${input.teamMemberId}/${Date.now()}-${input.fileName}`;
      const result = await storagePut(key, buffer, "image/jpeg");
      
      // Create portfolio item
      const id = await db.createPortfolioItem({
        teamMemberId: input.teamMemberId,
        title: input.title,
        description: input.description,
        category: input.category,
        imageKey: result.key,
        imageUrl: result.url,
        displayOrder: input.displayOrder,
        isFeatured: input.isFeatured,
      });
      
      return { id, ...result };
    }),

  // Admin: Update portfolio item
  updatePortfolioItem: adminSessionProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      displayOrder: z.number().optional(),
      isFeatured: z.number().optional(),
    }))
    .mutation(async ({ input }: { input: { id: number; title?: string; description?: string; category?: string; displayOrder?: number; isFeatured?: number } }) => {
      const { id, ...updates } = input;
      await db.updatePortfolioItem(id, updates);
      return { success: true };
    }),

  // Admin: Delete portfolio item
  deletePortfolioItem: adminSessionProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      await db.deletePortfolioItem(input.id);
      return { success: true };
    }),
});
