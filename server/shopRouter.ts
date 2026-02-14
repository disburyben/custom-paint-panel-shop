import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { adminSessionProcedure } from "./adminAuth";
import * as shopDb from "./shopDb";

export const shopRouter = router({
    // ── Products (public) ───────────────────────────────────

    /** Public: list active products */
    listProducts: publicProcedure.query(async () => {
        return await shopDb.getActiveProducts();
    }),

    /** Public: get product by slug with variants */
    getProductBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input }) => {
            const product = await shopDb.getProductBySlug(input.slug);
            if (!product) throw new Error("Product not found");
            const variants = await shopDb.getProductVariants(product.id);
            return { product, variants };
        }),

    // ── Products (admin) ────────────────────────────────────

    /** Admin: list ALL products (including inactive) */
    adminListProducts: adminSessionProcedure.query(async () => {
        return await shopDb.getAllProducts();
    }),

    /** Admin: get product by id with variants */
    adminGetProduct: adminSessionProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            const product = await shopDb.getProductById(input.id);
            if (!product) throw new Error("Product not found");
            const variants = await shopDb.getProductVariants(input.id);
            return { product, variants };
        }),

    /** Admin: create product */
    createProduct: adminSessionProcedure
        .input(
            z.object({
                name: z.string().min(1),
                slug: z.string().min(1),
                description: z.string().optional(),
                type: z.enum(["merchandise", "gift_certificate"]).default("merchandise"),
                category: z.string().optional(),
                basePrice: z.number(), // cents
                compareAtPrice: z.number().optional(),
                isActive: z.number().default(1),
                featured: z.number().default(0),
                displayOrder: z.number().default(0),
                trackInventory: z.number().default(1),
                inventoryQuantity: z.number().default(0),
                allowBackorder: z.number().default(0),
                hasVariants: z.number().default(0),
                images: z.string().optional(), // JSON array string
            })
        )
        .mutation(async ({ input }) => {
            return await shopDb.createProduct(input);
        }),

    /** Admin: update product */
    updateProduct: adminSessionProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().min(1).optional(),
                slug: z.string().min(1).optional(),
                description: z.string().nullable().optional(),
                type: z.enum(["merchandise", "gift_certificate"]).optional(),
                category: z.string().nullable().optional(),
                basePrice: z.number().optional(),
                compareAtPrice: z.number().nullable().optional(),
                isActive: z.number().optional(),
                featured: z.number().optional(),
                displayOrder: z.number().optional(),
                trackInventory: z.number().optional(),
                inventoryQuantity: z.number().optional(),
                allowBackorder: z.number().optional(),
                hasVariants: z.number().optional(),
                images: z.string().nullable().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...updates } = input;
            return await shopDb.updateProduct(id, updates);
        }),

    /** Admin: delete product */
    deleteProduct: adminSessionProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            return await shopDb.deleteProduct(input.id);
        }),

    // ── Variants (admin) ────────────────────────────────────

    /** Admin: add variant to a product */
    createVariant: adminSessionProcedure
        .input(
            z.object({
                productId: z.number(),
                name: z.string().min(1), // e.g. "Large / Black"
                price: z.number(), // cents
                size: z.string().optional(),
                color: z.string().optional(),
                sku: z.string().optional(),
                inventoryQuantity: z.number().default(0),
                isActive: z.number().default(1),
            })
        )
        .mutation(async ({ input }) => {
            return await shopDb.createVariant(input);
        }),

    /** Admin: update variant */
    updateVariant: adminSessionProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().optional(),
                price: z.number().optional(),
                size: z.string().optional(),
                color: z.string().optional(),
                sku: z.string().optional(),
                inventoryQuantity: z.number().optional(),
                isActive: z.number().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...updates } = input;
            return await shopDb.updateVariant(id, updates);
        }),

    /** Admin: delete variant */
    deleteVariant: adminSessionProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            return await shopDb.deleteVariant(input.id);
        }),

    // ── Orders (admin) ──────────────────────────────────────

    /** Admin: list all orders */
    adminListOrders: adminSessionProcedure.query(async () => {
        return await shopDb.getAllOrders();
    }),

    /** Admin: get order detail with items */
    adminGetOrder: adminSessionProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            const order = await shopDb.getOrderById(input.id);
            if (!order) throw new Error("Order not found");
            const items = await shopDb.getOrderItems(input.id);
            return { order, items };
        }),

    /** Admin: update order (status, tracking, notes) */
    updateOrder: adminSessionProcedure
        .input(
            z.object({
                id: z.number(),
                status: z
                    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
                    .optional(),
                trackingNumber: z.string().optional(),
                shippingCarrier: z.string().optional(),
                notes: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...updates } = input;
            return await shopDb.updateOrder(id, updates);
        }),

    // ── Gift Certificates (admin) ──────────────────────────

    /** Admin: list all gift certificates */
    adminListGiftCertificates: adminSessionProcedure.query(async () => {
        return await shopDb.getAllGiftCertificates();
    }),

    /** Admin: create gift certificate */
    createGiftCertificate: adminSessionProcedure
        .input(
            z.object({
                amount: z.number(), // cents
                recipientName: z.string().optional(),
                recipientEmail: z.string().email().optional(),
                message: z.string().optional(),
                expiresAt: z.string().optional(), // ISO date string
            })
        )
        .mutation(async ({ input }) => {
            const code = shopDb.generateGiftCertificateCode();
            return await shopDb.createGiftCertificate({
                code,
                amount: input.amount,
                balance: input.amount, // starts with full balance
                recipientName: input.recipientName ?? null,
                recipientEmail: input.recipientEmail ?? null,
                message: input.message ?? null,
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
                status: "active",
            });
        }),

    /** Admin: update gift certificate (balance, status) */
    updateGiftCertificate: adminSessionProcedure
        .input(
            z.object({
                id: z.number(),
                balance: z.number().optional(), // cents
                status: z.enum(["active", "redeemed", "expired", "cancelled"]).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...updates } = input;
            return await shopDb.updateGiftCertificate(id, updates);
        }),
});
