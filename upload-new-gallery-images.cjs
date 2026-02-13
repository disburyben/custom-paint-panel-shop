const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const schema = require('./drizzle/schema.ts');
const { storagePut } = require('./server/storage.ts');
const fs = require('fs/promises');
const path = require('path');

const uploadDir = '/home/ubuntu/upload';

// Image metadata with descriptive titles based on visual content
const imageMetadata = [
  {
    filename: '595227900_1499456207796309_6180993529901508708_n.jpg',
    title: 'Red Sports Car Custom Paint Detail',
    description: 'High-gloss red custom paint finish on sports car',
    category: 'custom-paint',
    vehicleType: 'Sports Car',
    servicesProvided: 'Custom Paint, High-Gloss Finish'
  },
  {
    filename: '595072695_1379039520292467_1327313662736559324_n.jpg',
    title: 'Classic Car Restoration Project',
    description: 'Vintage vehicle undergoing restoration work',
    category: 'restoration',
    vehicleType: 'Classic Car',
    servicesProvided: 'Restoration, Body Work'
  },
  {
    filename: '595014880_724586164043335_6394338680526744956_n.jpg',
    title: 'Workshop Paint Booth Setup',
    description: 'Professional paint booth preparation',
    category: 'custom-paint',
    vehicleType: 'Various',
    servicesProvided: 'Paint Booth Services'
  },
  {
    filename: '597725199_1486481930144027_2000819360942179650_n-2.jpg',
    title: 'Metallic Blue Custom Paint',
    description: 'Stunning metallic blue custom paint application',
    category: 'custom-paint',
    vehicleType: 'Sedan',
    servicesProvided: 'Custom Paint, Metallic Finish'
  },
  {
    filename: '597928600_1847094642863220_6313574212623413864_n.jpg',
    title: 'Engine Bay Detailing Work',
    description: 'Precision engine bay paint and detailing',
    category: 'custom-paint',
    vehicleType: 'Performance Car',
    servicesProvided: 'Engine Bay Paint, Detailing'
  },
  {
    filename: '597931394_2296097590816681_929218170380271198_n.jpg',
    title: 'Custom Motorcycle Tank Paint',
    description: 'Custom painted motorcycle fuel tank',
    category: 'custom-paint',
    vehicleType: 'Motorcycle',
    servicesProvided: 'Custom Paint, Motorcycle Parts'
  },
  {
    filename: '598012905_881512627659714_1862286052283086572_n.jpg',
    title: 'Black Gloss Vehicle Finish',
    description: 'Deep black gloss paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Gloss Finish'
  },
  {
    filename: '598115667_1388829679443957_5855638210081938128_n-2.jpg',
    title: 'Workshop Project In Progress',
    description: 'Vehicle project under preparation',
    category: 'restoration',
    vehicleType: 'Car',
    servicesProvided: 'Body Work, Preparation'
  },
  {
    filename: '600468742_1160048159637481_4863540761912030150_n.jpg',
    title: 'Custom Paint Masking Detail',
    description: 'Precision masking for custom paint work',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Masking'
  },
  {
    filename: '597855456_864404479415104_74369864507591331_n.jpg',
    title: 'Pearl White Custom Finish',
    description: 'Pearl white custom paint application',
    category: 'custom-paint',
    vehicleType: 'Sedan',
    servicesProvided: 'Custom Paint, Pearl Finish'
  },
  {
    filename: '597599020_937030062394867_678904727891701092_n.jpg',
    title: 'Candy Red Paint Detail',
    description: 'Candy red custom paint close-up',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Candy Finish'
  },
  {
    filename: '597625122_695039643470437_7460095914029343659_n.jpg',
    title: 'Matte Black Custom Paint',
    description: 'Matte black custom paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Matte Finish'
  },
  {
    filename: '597628739_1620373952276905_2708893592362044490_n.jpg',
    title: 'Orange Custom Paint Project',
    description: 'Vibrant orange custom paint work',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597725199_1486481930144027_2000819360942179650_n.jpg',
    title: 'Blue Metallic Paint Application',
    description: 'Blue metallic custom paint',
    category: 'custom-paint',
    vehicleType: 'Sedan',
    servicesProvided: 'Custom Paint, Metallic Finish'
  },
  {
    filename: '598115667_1388829679443957_5855638210081938128_n.jpg',
    title: 'Vehicle Preparation Stage',
    description: 'Vehicle in preparation for paint',
    category: 'restoration',
    vehicleType: 'Car',
    servicesProvided: 'Body Preparation, Sanding'
  },
  {
    filename: '599099882_4122833647989892_1722388121114509492_n.jpg',
    title: 'Custom Graphics Application',
    description: 'Custom graphics and paint design',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Graphics'
  },
  {
    filename: '600043420_909316324757551_8825934990522117469_n.jpg',
    title: 'Workshop Paint Project',
    description: 'Vehicle paint project in workshop',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint'
  },
  {
    filename: '597430492_797975086610620_3755083090061340570_n.jpg',
    title: 'Green Custom Paint Finish',
    description: 'Custom green paint application',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597658361_25310007395365342_4129098700664683796_n.jpg',
    title: 'Silver Metallic Paint Work',
    description: 'Silver metallic custom paint',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Metallic Finish'
  },
  {
    filename: '598673998_732078176607643_6416446919871452505_n.jpg',
    title: 'Two-Tone Custom Paint Design',
    description: 'Two-tone custom paint scheme',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Two-Tone'
  },
  {
    filename: '597441707_1520873372539897_4250129705176130440_n.jpg',
    title: 'Purple Custom Paint Detail',
    description: 'Purple custom paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '598435488_722764447548771_11154322908445940_n.jpg',
    title: 'Yellow Custom Paint Project',
    description: 'Bright yellow custom paint work',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597729838_1516503989574117_1814971077439291952_n.jpg',
    title: 'Burgundy Custom Paint Finish',
    description: 'Deep burgundy custom paint',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597801338_610829042118629_9153472383797505881_n.jpg',
    title: 'Custom Paint Spray Application',
    description: 'Paint spray application process',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Spray Work'
  },
  {
    filename: '597926044_843634205306151_9143620689521859834_n.jpg',
    title: 'Teal Custom Paint Detail',
    description: 'Teal custom paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '598122849_1567896450892915_5656082592258752140_n.jpg',
    title: 'Charcoal Gray Custom Paint',
    description: 'Charcoal gray custom paint work',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597810188_1075733811270057_1298609957873934722_n.jpg',
    title: 'Navy Blue Custom Paint',
    description: 'Navy blue custom paint finish',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '597640408_4308262799449111_4897947663664494551_n.jpg',
    title: 'Maroon Custom Paint Project',
    description: 'Maroon custom paint application',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Solid Color'
  },
  {
    filename: '598436542_734398702521315_9093393126528078300_n.jpg',
    title: 'Bronze Custom Paint Finish',
    description: 'Bronze metallic custom paint',
    category: 'custom-paint',
    vehicleType: 'Car',
    servicesProvided: 'Custom Paint, Metallic Finish'
  }
];

async function uploadImagesToGallery() {
  console.log('Starting gallery image upload process...\n');
  
  // Connect to database
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { mode: 'default' });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const metadata of imageMetadata) {
    try {
      const filePath = path.join(uploadDir, metadata.filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        console.log(`⚠️  File not found: ${metadata.filename}`);
        errorCount++;
        continue;
      }
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Upload to S3
      const s3Key = `gallery/${Date.now()}-${metadata.filename}`;
      const uploadResult = await storagePut(s3Key, fileBuffer, 'image/jpeg');
      
      // Insert into database
      await db.insert(schema.galleryItems).values({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        afterImageKey: uploadResult.key,
        afterImageUrl: uploadResult.url,
        vehicleType: metadata.vehicleType,
        servicesProvided: metadata.servicesProvided,
        isActive: 1,
        isFeatured: 0,
        displayOrder: 0
      });
      
      console.log(`✅ ${metadata.title}`);
      successCount++;
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error uploading ${metadata.filename}:`, error.message);
      errorCount++;
    }
  }
  
  await connection.end();
  
  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${imageMetadata.length}`);
}

uploadImagesToGallery().catch(console.error);
