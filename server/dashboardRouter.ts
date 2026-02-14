import { router } from "./_core/trpc";
import { adminSessionProcedure } from "./adminAuth";
import { getDb } from "./db";
import { count, eq, desc } from "drizzle-orm";
import {
    quoteSubmissions,
    blogPosts,
    testimonials,
    galleryItems,
    teamMembers,
    services,
    products,
    orders,
    giftCertificates,
} from "../drizzle/schema";

export const dashboardRouter = router({
    /** Single endpoint returning all dashboard stats */
    stats: adminSessionProcedure.query(async () => {
        const db = await getDb();
        if (!db) return null;

        // Run counts in parallel
        const [
            quotesResult,
            newQuotesResult,
            reviewedQuotesResult,
            blogResult,
            publishedBlogResult,
            testimonialsResult,
            pendingTestimonialsResult,
            galleryResult,
            teamResult,
            servicesResult,
            productsResult,
            activeProductsResult,
            ordersResult,
            pendingOrdersResult,
            giftCertsResult,
            activeGiftCertsResult,
        ] = await Promise.all([
            db.select({ count: count() }).from(quoteSubmissions),
            db.select({ count: count() }).from(quoteSubmissions).where(eq(quoteSubmissions.status, "new")),
            db.select({ count: count() }).from(quoteSubmissions).where(eq(quoteSubmissions.status, "reviewed")),
            db.select({ count: count() }).from(blogPosts),
            db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.isPublished, 1)),
            db.select({ count: count() }).from(testimonials),
            db.select({ count: count() }).from(testimonials).where(eq(testimonials.isApproved, 0)),
            db.select({ count: count() }).from(galleryItems),
            db.select({ count: count() }).from(teamMembers),
            db.select({ count: count() }).from(services),
            db.select({ count: count() }).from(products),
            db.select({ count: count() }).from(products).where(eq(products.isActive, 1)),
            db.select({ count: count() }).from(orders),
            db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")),
            db.select({ count: count() }).from(giftCertificates),
            db.select({ count: count() }).from(giftCertificates).where(eq(giftCertificates.status, "active")),
        ]);

        return {
            quotes: {
                total: quotesResult[0].count,
                new: newQuotesResult[0].count,
                reviewed: reviewedQuotesResult[0].count,
            },
            blog: {
                total: blogResult[0].count,
                published: publishedBlogResult[0].count,
            },
            testimonials: {
                total: testimonialsResult[0].count,
                pending: pendingTestimonialsResult[0].count,
            },
            gallery: { total: galleryResult[0].count },
            team: { total: teamResult[0].count },
            services: { total: servicesResult[0].count },
            products: {
                total: productsResult[0].count,
                active: activeProductsResult[0].count,
            },
            orders: {
                total: ordersResult[0].count,
                pending: pendingOrdersResult[0].count,
            },
            giftCertificates: {
                total: giftCertsResult[0].count,
                active: activeGiftCertsResult[0].count,
            },
        };
    }),

    /** Latest activity feed for the dashboard */
    recentActivity: adminSessionProcedure.query(async () => {
        const db = await getDb();
        if (!db) return { recentQuotes: [], recentOrders: [] };

        const [recentQuotes, recentOrders] = await Promise.all([
            db
                .select()
                .from(quoteSubmissions)
                .orderBy(desc(quoteSubmissions.createdAt))
                .limit(5),
            db
                .select()
                .from(orders)
                .orderBy(desc(orders.createdAt))
                .limit(5),
        ]);

        return { recentQuotes, recentOrders };
    }),
});
