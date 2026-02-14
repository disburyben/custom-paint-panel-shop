import { router, publicProcedure } from "./_core/trpc";
import { adminSessionProcedure as adminProcedure } from "./adminAuth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostById,
  getBlogPostBySlug,
  getAllBlogPosts,
  getFeaturedBlogPosts,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialById,
  getAllTestimonials,
  getFeaturedTestimonials,
  createService,
  updateService,
  deleteService,
  getServiceById,
  getServiceBySlug,
  getAllServices,
  getBusinessInfo,
  updateBusinessInfo,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryItemById,
  getAllGalleryItems,
  getGalleryItemsByCategory,
  getFeaturedGalleryItems,
} from "./cmsDb";

/**
 * Helper function to generate URL-friendly slugs
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const cmsRouter = router({
  /**
   * BLOG POSTS
   */
  blog: router({
    // Public: Get all published blog posts
    getAll: publicProcedure.query(async () => {
      return await getAllBlogPosts(true);
    }),

    // Public: Get featured blog posts
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().default(3) }))
      .query(async ({ input }) => {
        return await getFeaturedBlogPosts(input.limit);
      }),

    // Public: Get blog post by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getBlogPostBySlug(input.slug);
      }),

    // Admin: Get all blog posts (including drafts)
    getAllAdmin: adminProcedure.query(async () => {
      return await getAllBlogPosts(false);
    }),

    // Admin: Get blog post by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBlogPostById(input.id);
      }),

    // Admin: Create blog post
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          excerpt: z.string().optional(),
          content: z.string().min(1),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          isFeatured: z.boolean().default(false),
          isPublished: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const slug = generateSlug(input.title);
        return await createBlogPost({
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          category: input.category,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isFeatured: input.isFeatured ? 1 : 0,
          isPublished: input.isPublished ? 1 : 0,
          publishedAt: input.isPublished ? new Date() : null,
        });
      }),

    // Admin: Update blog post
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          isFeatured: z.boolean().optional(),
          isPublished: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.title) {
          updateData.title = data.title;
          updateData.slug = generateSlug(data.title);
        }
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
        if (data.content) updateData.content = data.content;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.tags) updateData.tags = JSON.stringify(data.tags);
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured ? 1 : 0;
        if (data.isPublished !== undefined) {
          updateData.isPublished = data.isPublished ? 1 : 0;
          if (data.isPublished) updateData.publishedAt = new Date();
        }

        return await updateBlogPost(id, updateData);
      }),

    // Admin: Delete blog post
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteBlogPost(input.id);
      }),
  }),

  /**
   * TESTIMONIALS
   */
  testimonials: router({
    // Public: Get all approved testimonials
    getAll: publicProcedure.query(async () => {
      return await getAllTestimonials(true);
    }),

    // Public: Get featured testimonials
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return await getFeaturedTestimonials(input.limit);
      }),

    // Admin: Get all testimonials
    getAllAdmin: adminProcedure.query(async () => {
      return await getAllTestimonials(false);
    }),

    // Admin: Get testimonial by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTestimonialById(input.id);
      }),

    // Admin: Create testimonial
    create: adminProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerTitle: z.string().optional(),
          quote: z.string().min(1),
          rating: z.number().min(1).max(5).default(5),
          isFeatured: z.boolean().default(false),
          isApproved: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        return await createTestimonial({
          customerName: input.customerName,
          customerTitle: input.customerTitle,
          quote: input.quote,
          rating: input.rating,
          isFeatured: input.isFeatured ? 1 : 0,
          isApproved: input.isApproved ? 1 : 0,
        });
      }),

    // Admin: Update testimonial
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          customerName: z.string().optional(),
          customerTitle: z.string().optional(),
          quote: z.string().optional(),
          rating: z.number().min(1).max(5).optional(),
          isFeatured: z.boolean().optional(),
          isApproved: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.customerName) updateData.customerName = data.customerName;
        if (data.customerTitle !== undefined) updateData.customerTitle = data.customerTitle;
        if (data.quote) updateData.quote = data.quote;
        if (data.rating) updateData.rating = data.rating;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured ? 1 : 0;
        if (data.isApproved !== undefined) updateData.isApproved = data.isApproved ? 1 : 0;

        return await updateTestimonial(id, updateData);
      }),

    // Admin: Delete testimonial
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteTestimonial(input.id);
      }),
  }),

  /**
   * SERVICES
   */
  services: router({
    // Public: Get all active services
    getAll: publicProcedure.query(async () => {
      return await getAllServices(true);
    }),

    // Public: Get service by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getServiceBySlug(input.slug);
      }),

    // Admin: Get all services
    getAllAdmin: adminProcedure.query(async () => {
      return await getAllServices(false);
    }),

    // Admin: Get service by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getServiceById(input.id);
      }),

    // Admin: Create service
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().min(1),
          shortDescription: z.string().optional(),
          startingPrice: z.number().optional(),
          priceDescription: z.string().optional(),
          features: z.array(z.string()).optional(),
          turnaroundTime: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const slug = generateSlug(input.name);
        return await createService({
          name: input.name,
          slug,
          description: input.description,
          shortDescription: input.shortDescription,
          startingPrice: input.startingPrice,
          priceDescription: input.priceDescription,
          features: input.features ? JSON.stringify(input.features) : null,
          turnaroundTime: input.turnaroundTime,
        });
      }),

    // Admin: Update service
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
          startingPrice: z.number().optional(),
          priceDescription: z.string().optional(),
          features: z.array(z.string()).optional(),
          turnaroundTime: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.name) {
          updateData.name = data.name;
          updateData.slug = generateSlug(data.name);
        }
        if (data.description) updateData.description = data.description;
        if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
        if (data.startingPrice !== undefined) updateData.startingPrice = data.startingPrice;
        if (data.priceDescription !== undefined) updateData.priceDescription = data.priceDescription;
        if (data.features) updateData.features = JSON.stringify(data.features);
        if (data.turnaroundTime !== undefined) updateData.turnaroundTime = data.turnaroundTime;
        if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0;

        return await updateService(id, updateData);
      }),

    // Admin: Delete service
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteService(input.id);
      }),
  }),

  /**
   * BUSINESS INFO
   */
  businessInfo: router({
    // Public: Get business info
    get: publicProcedure.query(async () => {
      return await getBusinessInfo();
    }),

    // Admin: Update business info
    update: adminProcedure
      .input(
        z.object({
          businessName: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
          businessHours: z.record(z.string(), z.any()).optional(),
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          youtube: z.string().optional(),
          aboutText: z.string().optional(),
          mission: z.string().optional(),
          yearsInBusiness: z.number().optional(),
          projectsCompleted: z.number().optional(),
          satisfactionRate: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = {};

        if (input.businessName) updateData.businessName = input.businessName;
        if (input.phone) updateData.phone = input.phone;
        if (input.email) updateData.email = input.email;
        if (input.address) updateData.address = input.address;
        if (input.businessHours) updateData.businessHours = JSON.stringify(input.businessHours);
        if (input.instagram) updateData.instagram = input.instagram;
        if (input.facebook) updateData.facebook = input.facebook;
        if (input.twitter) updateData.twitter = input.twitter;
        if (input.youtube) updateData.youtube = input.youtube;
        if (input.aboutText) updateData.aboutText = input.aboutText;
        if (input.mission) updateData.mission = input.mission;
        if (input.yearsInBusiness !== undefined) updateData.yearsInBusiness = input.yearsInBusiness;
        if (input.projectsCompleted !== undefined) updateData.projectsCompleted = input.projectsCompleted;
        if (input.satisfactionRate !== undefined) updateData.satisfactionRate = input.satisfactionRate;

        return await updateBusinessInfo(updateData);
      }),
  }),

  /**
   * GALLERY ITEMS
   */
  gallery: router({
    // Public: Get all active gallery items
    getAll: publicProcedure.query(async () => {
      return await getAllGalleryItems(true);
    }),

    // Public: Get gallery items by category
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getGalleryItemsByCategory(input.category, true);
      }),

    // Public: Get featured gallery items
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().default(6) }))
      .query(async ({ input }) => {
        return await getFeaturedGalleryItems(input.limit);
      }),

    // Admin: Get all gallery items
    getAllAdmin: adminProcedure.query(async () => {
      return await getAllGalleryItems(false);
    }),

    // Admin: Get gallery item by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getGalleryItemById(input.id);
      }),

    // Admin: Create gallery item
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          category: z.string().min(1),
          beforeImageUrl: z.string().min(1),
          afterImageUrl: z.string().min(1),
          isFeatured: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        return await createGalleryItem({
          title: input.title,
          description: input.description || null,
          category: input.category,
          isFeatured: input.isFeatured ? 1 : 0,
          beforeImageKey: `gallery/${nanoid()}-before`,
          beforeImageUrl: input.beforeImageUrl,
          afterImageKey: `gallery/${nanoid()}-after`,
          afterImageUrl: input.afterImageUrl,
        });
      }),

    // Admin: Update gallery item
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};

        if (data.title) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category) updateData.category = data.category;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured ? 1 : 0;
        if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0;

        return await updateGalleryItem(id, updateData);
      }),

    // Admin: Delete gallery item
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteGalleryItem(input.id);
      }),
  }),
});
