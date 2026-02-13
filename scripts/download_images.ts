import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
    "https://casperpaintworks-draft.manus.space/images/logo-full.png",
    "https://casperpaintworks-draft.manus.space/images/service-restoration.jpg",
    "https://casperpaintworks-draft.manus.space/images/engine-bay-prep-1.jpg",
    "https://casperpaintworks-draft.manus.space/images/engine-bay-paint-1.jpg",
    "https://casperpaintworks-draft.manus.space/images/service-paint.jpg",
    "https://casperpaintworks-draft.manus.space/images/feature-detail.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942595966-595227900_1499456207796309_6180993529901508708_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942597496-595072695_1379039520292467_1327313662736559324_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942598564-595014880_724586164043335_6394338680526744956_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942599442-597725199_1486481930144027_2000819360942179650_n-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942600125-597928600_1847094642863220_6313574212623413864_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942600766-597931394_2296097590816681_929218170380271198_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942601616-598012905_881512627659714_1862286052283086572_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942602261-598115667_1388829679443957_5855638210081938128_n-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942603122-600468742_1160048159637481_4863540761912030150_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942603769-597855456_864404479415104_74369864507591331_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942605086-597599020_937030062394867_678904727891701092_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942605758-597625122_695039643470437_7460095914029343659_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942606395-597628739_1620373952276905_2708893592362044490_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942607084-597725199_1486481930144027_2000819360942179650_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942607942-598115667_1388829679443957_5855638210081938128_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942608834-599099882_4122833647989892_1722388121114509492_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942609746-600043420_909316324757551_8825934990522117469_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942610612-597430492_797975086610620_3755083090061340570_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942611480-597658361_25310007395365342_4129098700664683796_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942612340-598673998_732078176607643_6416446919871452505_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942613027-597441707_1520873372539897_4250129705176130440_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942613915-598435488_722764447548771_11154322908445940_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942614573-597729838_1516503989574117_1814971077439291952_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942615525-597801338_610829042118629_9153472383797505881_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942616380-597926044_843634205306151_9143620689521859834_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942617026-598122849_1567896450892915_5656082592258752140_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942617908-597810188_1075733811270057_1298609957873934722_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942618796-597640408_4308262799449111_4897947663664494551_n.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663219924624/cP2ca2Nb9qAB97CQfMYV2n/gallery/1765942619764-598436542_734398702521315_9093393126528078300_n.jpg"
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function main() {
    const imagesDir = path.join(process.cwd(), 'client', 'public', 'images');
    const galleryDir = path.join(process.cwd(), 'client', 'public', 'gallery');

    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

    console.log(`Downloading ${images.length} images...`);

    for (const url of images) {
        try {
            let filename = url.split('/').pop();
            // Clean query params if any
            filename = filename.split('?')[0];

            let targetDir = imagesDir;
            if (url.includes('/gallery/')) {
                targetDir = galleryDir;
                // Keep unique filename from Cloudfront URL path if possible, or just last part
                // The URL is .../gallery/TIMESTAMP-NAME.jpg, which is perfect for filename
            } else if (url.includes('/images/')) {
                targetDir = imagesDir;
            }

            console.log(`Downloading ${filename} to ${targetDir}...`);
            await downloadImage(url, path.join(targetDir, filename));
        } catch (err) {
            console.error(`Failed to download ${url}:`, err.message);
        }
    }
    console.log('Download complete.');
}

main();
