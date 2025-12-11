import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { appRouter } from "../server/routers";
import type { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "../server/routers";

/**
 * Gallery Enhancement Tests
 * Tests for sprayer management and enhanced gallery features
 */

// Mock context for admin procedures
const mockAdminContext = {
  req: {
    cookies: {
      admin_session: "authenticated",
    },
  } as any,
  res: {} as any,
  user: {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
  },
};

// Mock context for public procedures
const mockPublicContext = {
  req: { cookies: {} } as any,
  res: {} as any,
  user: null,
};

// Create caller instances
const adminCaller = appRouter.createCaller(mockAdminContext);
const publicCaller = appRouter.createCaller(mockPublicContext);

// Store created IDs for cleanup
let createdSprayerId: number | null = null;
let createdGalleryItemId: number | null = null;

describe.sequential("Sprayer Management", () => {
  describe.sequential("Sprayer CRUD Operations", () => {
    it("should create a new sprayer", async () => {
      const input: inferProcedureInput<AppRouter["sprayer"]["create"]> = {
        name: "Test Sprayer",
        title: "Master Painter",
        bio: "Expert in custom automotive finishes",
        displayOrder: 1,
        isActive: 1,
      };

      const result = await adminCaller.sprayer.create(input);

      expect(result).toBeDefined();
      expect(result.name).toBe("Test Sprayer");
      expect(result.title).toBe("Master Painter");
      expect(result.bio).toBe("Expert in custom automotive finishes");
      expect(result.isActive).toBe(1);

      createdSprayerId = result.id;
    });

    it("should get all sprayers (admin)", async () => {
      const sprayers = await adminCaller.sprayer.getAllSprayers();

      expect(Array.isArray(sprayers)).toBe(true);
      expect(sprayers.length).toBeGreaterThan(0);

      const testSprayer = sprayers.find((s) => s.id === createdSprayerId);
      expect(testSprayer).toBeDefined();
      expect(testSprayer?.name).toBe("Test Sprayer");
    });

    it("should get active sprayers only (public)", async () => {
      const sprayers = await publicCaller.sprayer.getActiveSprayers();

      expect(Array.isArray(sprayers)).toBe(true);
      // All returned sprayers should be active
      sprayers.forEach((sprayer) => {
        expect(sprayer.isActive).toBe(1);
      });
    });

    it("should get sprayer by ID", async () => {
      if (!createdSprayerId) {
        throw new Error("No sprayer created yet");
      }

      const sprayer = await publicCaller.sprayer.getById({
        id: createdSprayerId,
      });

      expect(sprayer).toBeDefined();
      expect(sprayer?.id).toBe(createdSprayerId);
      expect(sprayer?.name).toBe("Test Sprayer");
    });

    it("should update a sprayer", async () => {
      if (!createdSprayerId) {
        throw new Error("No sprayer created yet");
      }

      const input: inferProcedureInput<AppRouter["sprayer"]["update"]> = {
        id: createdSprayerId,
        name: "Updated Test Sprayer",
        title: "Lead Technician",
      };

      const result = await adminCaller.sprayer.update(input);

      expect(result).toBeDefined();
      expect(result.name).toBe("Updated Test Sprayer");
      expect(result.title).toBe("Lead Technician");
      expect(result.bio).toBe("Expert in custom automotive finishes"); // Should preserve bio
    });

    it("should toggle sprayer active status", async () => {
      if (!createdSprayerId) {
        throw new Error("No sprayer created yet");
      }

      // Toggle to inactive
      const result1 = await adminCaller.sprayer.toggleActive({
        id: createdSprayerId,
      });
      expect(result1.isActive).toBe(0);

      // Toggle back to active
      const result2 = await adminCaller.sprayer.toggleActive({
        id: createdSprayerId,
      });
      expect(result2.isActive).toBe(1);
    });
  });
});

describe.sequential("Enhanced Gallery Management", () => {
  describe.sequential("Gallery Item CRUD with Metadata", () => {
    it("should create a gallery item with sprayer and metadata", async () => {
      if (!createdSprayerId) {
        throw new Error("No sprayer created yet");
      }

      const input: inferProcedureInput<AppRouter["gallery"]["create"]> = {
        title: "1967 Mustang Restoration",
        description: "Complete frame-off restoration with custom candy apple red paint",
        category: "restoration",
        vehicleType: "1967 Ford Mustang Fastback",
        servicesProvided: "Custom Paint, Chrome Delete, Engine Bay Detail, Interior Restoration",
        sprayerId: createdSprayerId,
        beforeImageKey: "test/before-image.jpg",
        beforeImageUrl: "https://example.com/before.jpg",
        afterImageKey: "test/after-image.jpg",
        afterImageUrl: "https://example.com/after.jpg",
        displayOrder: 1,
        isFeatured: 1,
        isActive: 1,
      };

      const result = await adminCaller.gallery.create(input);

      expect(result).toBeDefined();
      expect(result.title).toBe("1967 Mustang Restoration");
      expect(result.vehicleType).toBe("1967 Ford Mustang Fastback");
      expect(result.servicesProvided).toBe("Custom Paint, Chrome Delete, Engine Bay Detail, Interior Restoration");
      expect(result.sprayerId).toBe(createdSprayerId);
      expect(result.isFeatured).toBe(1);

      createdGalleryItemId = result.id;
    });

    it("should get all gallery items with sprayer info (admin)", async () => {
      const items = await adminCaller.gallery.getAllItems({
        includeInactive: true,
      });

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);

      const testItem = items.find((item) => item.id === createdGalleryItemId);
      expect(testItem).toBeDefined();
      expect(testItem?.sprayer).toBeDefined();
      expect(testItem?.sprayer?.id).toBe(createdSprayerId);
      expect(testItem?.vehicleType).toBe("1967 Ford Mustang Fastback");
    });

    it("should get active gallery items (public)", async () => {
      const items = await publicCaller.gallery.getActiveItems();

      expect(Array.isArray(items)).toBe(true);
      // All returned items should be active
      items.forEach((item) => {
        expect(item.isActive).toBe(1);
      });

      const testItem = items.find((item) => item.id === createdGalleryItemId);
      expect(testItem).toBeDefined();
      expect(testItem?.sprayer).toBeDefined();
    });

    it("should get gallery items by sprayer", async () => {
      if (!createdSprayerId) {
        throw new Error("No sprayer created yet");
      }

      const items = await publicCaller.gallery.getBySprayer({
        sprayerId: createdSprayerId,
      });

      expect(Array.isArray(items)).toBe(true);
      // All items should belong to the specified sprayer
      items.forEach((item) => {
        expect(item.sprayerId).toBe(createdSprayerId);
        expect(item.sprayer).toBeDefined();
        expect(item.sprayer?.id).toBe(createdSprayerId);
      });
    });

    it("should get gallery items by category", async () => {
      const items = await publicCaller.gallery.getByCategory({
        category: "restoration",
      });

      expect(Array.isArray(items)).toBe(true);
      // All items should belong to the specified category
      items.forEach((item) => {
        expect(item.category).toBe("restoration");
      });

      const testItem = items.find((item) => item.id === createdGalleryItemId);
      expect(testItem).toBeDefined();
    });

    it("should get featured gallery items", async () => {
      const items = await publicCaller.gallery.getFeatured({ limit: 10 });

      expect(Array.isArray(items)).toBe(true);
      // All items should be featured
      items.forEach((item) => {
        expect(item.isFeatured).toBe(1);
        expect(item.isActive).toBe(1);
      });

      const testItem = items.find((item) => item.id === createdGalleryItemId);
      expect(testItem).toBeDefined();
    });

    it("should update gallery item metadata", async () => {
      if (!createdGalleryItemId) {
        throw new Error("No gallery item created yet");
      }

      const input: inferProcedureInput<AppRouter["gallery"]["update"]> = {
        id: createdGalleryItemId,
        title: "Updated 1967 Mustang",
        vehicleType: "1967 Ford Mustang GT Fastback",
        servicesProvided: "Custom Candy Apple Red Paint, Full Chrome Delete, Complete Engine Bay Detail",
      };

      const result = await adminCaller.gallery.update(input);

      expect(result).toBeDefined();
      expect(result.title).toBe("Updated 1967 Mustang");
      expect(result.vehicleType).toBe("1967 Ford Mustang GT Fastback");
      expect(result.servicesProvided).toBe("Custom Candy Apple Red Paint, Full Chrome Delete, Complete Engine Bay Detail");
    });

    it("should toggle gallery item featured status", async () => {
      if (!createdGalleryItemId) {
        throw new Error("No gallery item created yet");
      }

      // Toggle to not featured
      const result1 = await adminCaller.gallery.toggleFeatured({
        id: createdGalleryItemId,
      });
      expect(result1.isFeatured).toBe(0);

      // Toggle back to featured
      const result2 = await adminCaller.gallery.toggleFeatured({
        id: createdGalleryItemId,
      });
      expect(result2.isFeatured).toBe(1);
    });

    it("should toggle gallery item active status", async () => {
      if (!createdGalleryItemId) {
        throw new Error("No gallery item created yet");
      }

      // Toggle to inactive
      const result1 = await adminCaller.gallery.toggleActive({
        id: createdGalleryItemId,
      });
      expect(result1.isActive).toBe(0);

      // Verify it doesn't appear in public queries
      const publicItems = await publicCaller.gallery.getActiveItems();
      const inactiveItem = publicItems.find((item) => item.id === createdGalleryItemId);
      expect(inactiveItem).toBeUndefined();

      // Toggle back to active
      const result2 = await adminCaller.gallery.toggleActive({
        id: createdGalleryItemId,
      });
      expect(result2.isActive).toBe(1);
    });
  });
});

describe.sequential("Cleanup", () => {
  it("should delete test gallery item", async () => {
    if (!createdGalleryItemId) {
      return; // Skip if no item was created
    }

    const result = await adminCaller.gallery.delete({
      id: createdGalleryItemId,
    });

    expect(result.success).toBe(true);

    // Verify deletion
    const item = await publicCaller.gallery.getById({
      id: createdGalleryItemId,
    });
    expect(item).toBeNull();
  });

  it("should delete test sprayer", async () => {
    if (!createdSprayerId) {
      return; // Skip if no sprayer was created
    }

    const result = await adminCaller.sprayer.delete({
      id: createdSprayerId,
    });

    expect(result.success).toBe(true);

    // Verify deletion
    const sprayer = await publicCaller.sprayer.getById({
      id: createdSprayerId,
    });
    expect(sprayer).toBeNull();
  });
});
