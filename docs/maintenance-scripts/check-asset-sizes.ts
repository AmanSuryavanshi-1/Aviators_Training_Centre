import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.join(process.cwd(), 'docs', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.API_Key,
    api_secret: process.env.API_Secret,
});

async function checkAssetSizes() {
    try {
        console.log("Fetching asset metadata from Cloudinary...");

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'aviators-training-centre/docs-assets',
            max_results: 500,
        });

        console.log(`Found ${result.resources.length} assets.`);
        console.log("---------------------------------------------------");
        console.log("Large Assets (> 3MB) or Huge Dimensions (> 4000px):");
        console.log("---------------------------------------------------");

        let largeCount = 0;

        for (const resource of result.resources) {
            const sizeMB = resource.bytes / (1024 * 1024);
            const isLarge = sizeMB > 3; // GitHub often struggles with > 5MB, but 3MB is a safe warning
            const isHuge = resource.width > 4000 || resource.height > 4000;

            if (isLarge || isHuge) {
                largeCount++;
                console.log(`ID: ${resource.public_id}`);
                console.log(`   Size: ${sizeMB.toFixed(2)} MB`);
                console.log(`   Dims: ${resource.width}x${resource.height}`);
                console.log(`   URL:  ${resource.secure_url}`);
                console.log("");
            }
        }

        if (largeCount === 0) {
            console.log("No exceptionally large assets found.");
        } else {
            console.log(`Total problematic assets: ${largeCount}`);
        }

    } catch (error) {
        console.error("Error checking assets:", error);
    }
}

checkAssetSizes();
