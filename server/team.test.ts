import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context factory
function createMockContext(isAdmin = false): TrpcContext {
  return {
    req: {
      protocol: "http",
      cookies: isAdmin ? { admin_session: "authenticated" } : {},
    } as any,
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as any,
    user: null,
  };
}

describe("Team Management", () => {
  describe("team.list (public)", () => {
    it("should return only active team members", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const members = await caller.team.list();
      
      expect(Array.isArray(members)).toBe(true);
      // All returned members should be active
      members.forEach(member => {
        expect(member.isActive).toBe(1);
      });
    });
  });

  describe("team.adminList (admin only)", () => {
    it("should require admin authentication", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.team.adminList()).rejects.toThrow("Admin authentication required");
    });

    it("should return all team members for admin", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const members = await caller.team.adminList();
      
      expect(Array.isArray(members)).toBe(true);
    });
  });

  describe("team.create (admin only)", () => {
    it("should require admin authentication", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.team.create({
          name: "Test Artist",
          title: "Master Painter",
          displayOrder: 0,
        })
      ).rejects.toThrow("Admin authentication required");
    });

    it("should create a new team member", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.team.create({
        name: "Test Artist",
        title: "Master Painter",
        bio: "Expert in custom finishes",
        specialty: "Candy Paint",
        displayOrder: 0,
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });
  });

  describe("team.update (admin only)", () => {
    it("should require admin authentication", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.team.update({
          id: 1,
          name: "Updated Name",
        })
      ).rejects.toThrow("Admin authentication required");
    });

    it("should update team member details", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      // First create a member
      const created = await caller.team.create({
        name: "Original Name",
        title: "Painter",
        displayOrder: 0,
      });

      // Then update it
      const result = await caller.team.update({
        id: created.id,
        name: "Updated Name",
        specialty: "Chrome Work",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("team.getWithPortfolio", () => {
    it("should return team member with their portfolio", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      // Create a team member
      const member = await caller.team.create({
        name: "Portfolio Test",
        title: "Artist",
        displayOrder: 0,
      });

      // Get member with portfolio
      const result = await caller.team.getWithPortfolio({ id: member.id });

      expect(result).toHaveProperty("member");
      expect(result).toHaveProperty("portfolio");
      expect(result.member.name).toBe("Portfolio Test");
      expect(Array.isArray(result.portfolio)).toBe(true);
    });

    it("should throw error for non-existent member", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.team.getWithPortfolio({ id: 999999 })
      ).rejects.toThrow("Team member not found");
    });
  });

  describe("team.delete (admin only)", () => {
    it("should require admin authentication", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.team.delete({ id: 1 })
      ).rejects.toThrow("Admin authentication required");
    });

    it("should delete team member and their portfolio", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      // Create a member
      const member = await caller.team.create({
        name: "To Delete",
        title: "Test",
        displayOrder: 0,
      });

      // Delete it
      const result = await caller.team.delete({ id: member.id });

      expect(result.success).toBe(true);

      // Verify it's gone
      await expect(
        caller.team.getWithPortfolio({ id: member.id })
      ).rejects.toThrow("Team member not found");
    });
  });
});
