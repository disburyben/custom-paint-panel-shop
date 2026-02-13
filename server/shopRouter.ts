import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as shopDb from "./shopDb";
// import Stripe from "stripe";
import { nanoid } from "nanoid";

// Initialize Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
//     apiVersion: "2024-06-20", // Use latest or appropriate version
// });

export const shopRouter = router({
    products: router({
        list: publicProcedure.query(async () => {
            const products = await shopDb.getActiveProducts();
            return products;
        }),

        // Admin: List all products
        listAdmin: adminProcedure.query(async () => {
            return await shopDb.getAllProducts();
        }),

        // Admin: Create product
        create: adminProcedure
            .input(z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                basePrice: z.number().min(0),
                type: z.enum(['physical', 'gift_certificate', 'service']),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().default(true),
                hasVariants: z.boolean().default(false),
            }))
            .mutation(async ({ input }) => {
                const slug = input.name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");

                return await shopDb.createProduct({
                    name: input.name,
                    description: input.description,
                    basePrice: input.basePrice,
                    type: input.type,
                    isActive: input.isActive ? 1 : 0,
                    hasVariants: input.hasVariants ? 1 : 0,
                    slug: `${slug}-${nanoid(6)}`, // Ensure uniqueness
                    images: input.images ? JSON.stringify(input.images) : '[]',
                    displayOrder: 0,
                });
            }),

        // Admin: Update product
        update: adminProcedure
            .input(z.object({
                id: z.number(),
                name: z.string().optional(),
                description: z.string().optional(),
                basePrice: z.number().optional(),
                type: z.enum(['physical', 'gift_certificate', 'service']).optional(),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional(),
                hasVariants: z.boolean().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                const updateData: any = { ...data };
                if (data.images) {
                    updateData.images = JSON.stringify(data.images);
                }
                return await shopDb.updateProduct(id, updateData);
            }),

        // Admin: Delete product
        delete: adminProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await shopDb.deleteProduct(input.id);
            }),

        get: publicProcedure
            .input(z.object({ slug: z.string() }))
            .query(async ({ input }) => {
                const product = await shopDb.getProductBySlug(input.slug);
                if (!product) return null;

                // Fetch variants if applicable
                const variants = product.hasVariants
                    ? await shopDb.getProductVariants(product.id)
                    : [];

                return { ...product, variants };
            }),
    }),

    checkout: router({
        createSession: publicProcedure
            .input(z.object({
                items: z.array(z.object({
                    productId: z.number(),
                    variantId: z.number().optional().nullable(),
                    quantity: z.number().min(1),
                })),
                customerEmail: z.string().email(),
                customerName: z.string(),
                giftRecipient: z.object({
                    name: z.string().optional(),
                    email: z.string().email().optional(),
                    message: z.string().optional(),
                }).optional(),
            }))
            .mutation(async ({ input }) => {
                // Temporary mock implementation
                return { url: "#" };
                /*
                if (!process.env.STRIPE_SECRET_KEY) {
                    throw new Error("Stripe secret key not configured");
                }

                const lineItems = [];
                let subtotal = 0;

                // Process items
                for (const item of input.items) {
                    const product = await shopDb.getProductById(item.productId);
                    if (!product) throw new Error(`Product ${item.productId} not found`);

                    let price = product.basePrice;
                    let name = product.name;
                    let image = product.images ? JSON.parse(product.images as string)[0] : '';

                    if (item.variantId) {
                        const variant = await shopDb.getVariantById(item.variantId);
                        if (variant) {
                            price = variant.price;
                            name = `${name} - ${variant.name}`;
                        }
                    }

                    subtotal += price * item.quantity;

                    lineItems.push({
                        price_data: {
                            currency: 'aud',
                            product_data: {
                                name: name,
                                images: image ? [image] : [],
                            },
                            unit_amount: price,
                        },
                        quantity: item.quantity,
                    });
                }

                // Create initial order in DB
                const orderNumber = shopDb.generateOrderNumber();
                const order = await shopDb.createOrder({
                    orderNumber,
                    customerEmail: input.customerEmail,
                    customerName: input.customerName,
                    subtotal: subtotal,
                    total: subtotal, // Add shipping/tax later if needed
                    paymentStatus: 'pending',
                    status: 'pending',
                    shippingAddress: '{}', // capture from Stripe session later or input
                });

                // Create Stripe Session
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: lineItems,
                    mode: 'payment',
                    success_url: `${process.env.BASE_URL || 'http://localhost:5173'}/shop/success?order=${orderNumber}`,
                    cancel_url: `${process.env.BASE_URL || 'http://localhost:5173'}/shop/cancel`,
                    customer_email: input.customerEmail,
                    client_reference_id: order.id.toString(),
                    metadata: {
                        orderId: order.id.toString(),
                        orderNumber: orderNumber,
                        giftRecipientName: input.giftRecipient?.name || '',
                        giftRecipientEmail: input.giftRecipient?.email || '',
                        giftMessage: input.giftRecipient?.message || '',
                    },
                });

                // Update order with session ID
                await shopDb.updateOrder(order.id, {
                    stripeCheckoutSessionId: session.id
                });

                return { url: session.url };
                */
            }),
    }),
});
