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

async function listAssets() {
    try {
        console.log("Fetching resources from 'aviators-training-centre/docs-assets'...");

        // Fetch resources in the specific folder
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'aviators-training-centre/docs-assets',
            max_results: 100,
        });

        console.log("Found assets:");
        const assetMap: Record<string, string> = {};

        for (const resource of result.resources) {
            console.log(`ID: ${resource.public_id}`);
            console.log(`URL: ${resource.secure_url}`);

            const parts = resource.public_id.split('/');
            const filename = parts[parts.length - 1];
            assetMap[filename] = resource.secure_url;
        }

        return assetMap;

    } catch (error) {
        console.error("Error fetching assets:", error);
        return null;
    }
}

listAssets();
