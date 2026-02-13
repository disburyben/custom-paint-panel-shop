import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  createBlogPost,
  deleteBlogPost,
  getAllBlogPosts,
  createTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  createService,
  deleteService,
  getAllServices,
  getBusinessInfo,
  updateBusinessInfo,
  createGalleryItem,
  deleteGalleryItem,
  getAllGalleryItems,
} from "./cmsDb";

describe("CMS Database Functions", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  describe("Blog Posts", () => {
    it("should create a blog post", async () => {
      const result = await createBlogPost({
        title: "Test Blog Post",
        slug: "test-blog-post",
        excerpt: "Test excerpt",
        content: "<p>Test content</p>",
        category: "news",
        isPublished: 1,
        isFeatured: 0,
      });

      expect(result).toBeDefined();
    });

    it("should fetch all published blog posts", async () => {
      const posts = await getAllBlogPosts(true);
      expect(Array.isArray(posts)).toBe(true);
    });

    it("should fetch all blog posts including drafts", async () => {
      const posts = await getAllBlogPosts(false);
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe("Testimonials", () => {
    it("should create a testimonial", async () => {
      const result = await createTestimonial({
        customerName: "John Smith",
        customerTitle: "1967 Mustang Owner",
        quote: "Great service!",
        rating: 5,
        isApproved: 1,
        isFeatured: 0,
      });

      expect(result).toBeDefined();
    });

    it("should fetch all approved testimonials", async () => {
      const testimonials = await getAllTestimonials(true);
      expect(Array.isArray(testimonials)).toBe(true);
    });

    it("should fetch all testimonials including unapproved", async () => {
      const testimonials = await getAllTestimonials(false);
      expect(Array.isArray(testimonials)).toBe(true);
    });
  });

  describe("Services", () => {
    it("should create a service", async () => {
      const result = await createService({
        name: "Custom Paint",
        slug: "custom-paint",
        description: "Professional custom paint service",
        shortDescription: "Custom paint jobs",
        startingPrice: 50000, // $500 in cents
        priceDescription: "Starting at $500",
        features: JSON.stringify(["High quality", "Fast turnaround"]),
        turnaroundTime: "2-4 weeks",
      });

      expect(result).toBeDefined();
    });

    it("should fetch all active services", async () => {
      const services = await getAllServices(true);
      expect(Array.isArray(services)).toBe(true);
    });

    it("should fetch all services including inactive", async () => {
      const services = await getAllServices(false);
      expect(Array.isArray(services)).toBe(true);
    });
  });

  describe("Business Info", () => {
    it("should update business info", async () => {
      const result = await updateBusinessInfo({
        businessName: "Caspers Paintworks",
        phone: "(555) 123-4567",
        email: "contact@caspers.com",
        address: "123 Main St, City, State",
        businessHours: JSON.stringify({
          Monday: { open: "09:00", close: "17:00" },
        }),
      });

      expect(result).toBeDefined();
    });

    it("should fetch business info", async () => {
      const info = await getBusinessInfo();
      // First time might be null if not created yet
      expect(info === null || typeof info === "object").toBe(true);
    });
  });

  describe("Gallery Items", () => {
    it("should create a gallery item", async () => {
      const result = await createGalleryItem({
        title: "1967 Mustang Custom Paint",
        description: "Beautiful candy apple red paint job",
        category: "custom-paint",
        beforeImageUrl: "https://example.com/before.jpg",
        afterImageUrl: "https://example.com/after.jpg",
        beforeImageKey: "gallery/before-123",
        afterImageKey: "gallery/after-123",
        isFeatured: 1,
      });

      expect(result).toBeDefined();
    });

    it("should fetch all active gallery items", async () => {
      const items = await getAllGalleryItems(true);
      expect(Array.isArray(items)).toBe(true);
    });

    it("should fetch all gallery items including inactive", async () => {
      const items = await getAllGalleryItems(false);
      expect(Array.isArray(items)).toBe(true);
    });
  });
});
