import { db } from "./db";
import { galleryItems } from "../drizzle/schema";
import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";

const imagesDir = path.resolve(process.cwd(), "client/public/images");

const imageMetadata = [
    { filename: "service-restoration.jpg", title: "Classic Restoration", category: "Restoration", description: "Full vehicle restoration to factory specs." },
    { filename: "engine-bay-paint-1.jpg", title: "Engine Bay Custom Paint", category: "Engine Bay", description: "Detailed engine bay painting." },
    { filename: "engine-bay-paint-2.jpg", title: "Engine Bay Finish", category: "Engine Bay", description: "High gloss engine bay finish." },
    { filename: "engine-bay-prep-1.jpg", title: "Engine Bay Prep", category: "Engine Bay", description: "Preparation work for engine bay painting." },
    { filename: "engine-bay-prep-2.jpg", title: "Sanding & Masking", category: "Engine Bay", description: "Detailed sanding and masking for engine bay." },
    { filename: "service-paint.jpg", title: "Custom Spray Job", category: "Custom Paint", description: "Professional custom spray application." },
    { filename: "feature-detail.jpg", title: "Detailed Finish", category: "Custom Paint", description: "Close up of the high quality finish." },
    { filename: "owner-painting.jpg", title: "Master at Work", category: "Workshop", description: "Casper applying the final coat." },
    { filename: "hero-bg.jpg", title: "Showroom Quality", category: "Custom Paint", description: "Examples of our premium work." },
    { filename: "about-workshop.jpg", title: "Our Workshop", category: "Workshop", description: "State of the art painting facility." },
];

export async function seedGallery() {
    console.log("Checking gallery data...");
    try {
        const existing = await db.select({ count: sql<number>`count(*)` }).from(galleryItems);
        const count = existing[0]?.count || 0;

        if (count > 0) {
            console.log(`Gallery already has ${count} items. Skipping seed.`);
            return;
        }

        console.log(`Seeding gallery from ${imagesDir}...`);

        if (!fs.existsSync(imagesDir)) {
            console.warn(`Images directory not found: ${imagesDir}`);
            return;
        }

        let inserted = 0;
        for (const meta of imageMetadata) {
            if (!fs.existsSync(path.join(imagesDir, meta.filename))) {
                console.warn(`Skipping missing image: ${meta.filename}`);
                continue;
            }

            const imageUrl = `/images/${meta.filename}`;
            await db.insert(galleryItems).values({
                title: meta.title,
                description: meta.description,
                category: meta.category,
                afterImageUrl: imageUrl,
                afterImageKey: meta.filename,
                isActive: 1,
                isFeatured: 0,
                displayOrder: 0,
                vehicleType: "Car",
                servicesProvided: meta.category,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            inserted++;
        }
        console.log(`Seeded ${inserted} gallery items.`);
    } catch (error) {
        console.error("Error seeding gallery:", error);
    }
}
