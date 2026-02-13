import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { galleryItems } from './drizzle/schema';
import { eq } from 'drizzle-orm';

// Define before/after pairs based on image analysis
// We'll pair preparation/workshop images (before) with finished custom paint (after)
const beforeAfterPairs = [
  {
    // Engine bay transformation pair 1
    beforeTitle: 'Engine Bay Detailing Work',
    afterTitle: 'Engine Bay Detailing Work', // Same image, we'll use local engine-bay images
    useLocalImages: true,
    beforeImageKey: 'local/engine-bay-prep-1.jpg',
    beforeImageUrl: '/images/engine-bay-prep-1.jpg',
    afterImageKey: 'local/engine-bay-paint-1.jpg',
    afterImageUrl: '/images/engine-bay-paint-1.jpg',
    newTitle: 'Burgundy Engine Bay Transformation',
    description: 'Complete engine bay restoration with custom burgundy paint and detailing',
    category: 'restoration',
    vehicleType: 'Performance Car',
    servicesProvided: 'Engine Bay Restoration, Custom Paint'
  },
  {
    // Workshop prep to finished paint
    beforeTitle: 'Workshop Project In Progress',
    afterTitle: 'Workshop Paint Project',
    newTitle: 'Complete Custom Paint Transformation',
    description: 'From bare preparation to stunning custom paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Body Preparation, Custom Paint'
  },
  {
    // Vehicle prep to metallic blue
    beforeTitle: 'Vehicle Preparation Stage',
    afterTitle: 'Metallic Blue Custom Paint',
    newTitle: 'Metallic Blue Sedan Transformation',
    description: 'Professional body preparation to flawless metallic blue finish',
    category: 'custom-paint',
    vehicleType: 'Sedan',
    servicesProvided: 'Body Preparation, Custom Paint, Metallic Finish'
  },
  {
    // Classic restoration
    beforeTitle: 'Classic Car Restoration Project',
    afterTitle: 'Bronze Custom Paint Finish',
    newTitle: 'Classic Car Full Restoration',
    description: 'Vintage vehicle brought back to life with modern paint technology',
    category: 'restoration',
    vehicleType: 'Classic Car',
    servicesProvided: 'Full Restoration, Custom Paint'
  },
  {
    // Masking to finished
    beforeTitle: 'Custom Paint Masking Detail',
    afterTitle: 'Two-Tone Custom Paint Design',
    newTitle: 'Two-Tone Custom Paint Project',
    description: 'Precision masking and two-tone paint application',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Two-Tone, Precision Masking'
  }
];

async function createBeforeAfterPairs() {
  console.log('Creating before/after gallery pairs...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { mode: 'default' });
  
  // Get all current gallery items
  const allItems = await db.select().from(galleryItems);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const pair of beforeAfterPairs) {
    try {
      let beforeImage, afterImage;
      
      if (pair.useLocalImages) {
        // Use local public images
        beforeImage = {
          afterImageKey: pair.beforeImageKey,
          afterImageUrl: pair.beforeImageUrl
        };
        afterImage = {
          afterImageKey: pair.afterImageKey,
          afterImageUrl: pair.afterImageUrl
        };
      } else {
        // Find images by title
        beforeImage = allItems.find(item => item.title === pair.beforeTitle);
        afterImage = allItems.find(item => item.title === pair.afterTitle);
        
        if (!beforeImage || !afterImage) {
          console.log(`⚠️  Could not find pair: ${pair.beforeTitle} -> ${pair.afterTitle}`);
          errorCount++;
          continue;
        }
      }
      
      // Create new gallery item with before/after
      await db.insert(galleryItems).values({
        title: pair.newTitle,
        description: pair.description,
        category: pair.category,
        beforeImageKey: beforeImage.afterImageKey || '',
        beforeImageUrl: beforeImage.afterImageUrl || '',
        afterImageKey: afterImage.afterImageKey || '',
        afterImageUrl: afterImage.afterImageUrl || '',
        vehicleType: pair.vehicleType,
        servicesProvided: pair.servicesProvided,
        isActive: 1,
        isFeatured: 1, // Mark as featured to highlight transformations
        displayOrder: 0
      });
      
      console.log(`✅ Created: ${pair.newTitle}`);
      successCount++;
      
    } catch (error: any) {
      console.error(`❌ Error creating pair ${pair.newTitle}:`, error.message);
      errorCount++;
    }
  }
  
  await connection.end();
  
  console.log(`\n📊 Before/After Pairs Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${beforeAfterPairs.length}`);
}

createBeforeAfterPairs().catch(console.error);
