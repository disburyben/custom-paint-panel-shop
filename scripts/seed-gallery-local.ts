import { db } from "../server/db";
import { galleryItems } from "../drizzle/schema";
import fs from "fs";
import path from "path";

// Use absolute path to ensure we find the images
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

async function seed() {
    console.log("Seeding gallery with local images...");
    console.log(`Looking for images in: ${imagesDir}`);

    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
        console.error(`Error: Directory not found: ${imagesDir}`);
        process.exit(1);
    }

    let count = 0;
    for (const meta of imageMetadata) {
        // Check if file exists
        // Note: We don't strictly need to check if file exists to insert into DB if we know the URL is right, 
        // but it matches the 'import' logic.
        if (!fs.existsSync(path.join(imagesDir, meta.filename))) {
            console.warn(`Skipping ${meta.filename}: File not found in ${imagesDir}`);
            continue;
        }

        const imageUrl = `/images/${meta.filename}`;

        try {
            // Insert
            await db.insert(galleryItems).values({
                title: meta.title,
                description: meta.description,
                category: meta.category,
                afterImageUrl: imageUrl,
                afterImageKey: meta.filename, // Use filename as key for local
                isActive: 1,
                isFeatured: 0,
                displayOrder: 0,
                vehicleType: "Car", // Default
                servicesProvided: meta.category,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`Added ${meta.title}`);
            count++;
        } catch (e) {
            console.error(`Failed to insert ${meta.title}:`, e);
        }
    }

    console.log(`Done. Added ${count} items.`);
    process.exit(0);
}

seed().catch(console.error);
