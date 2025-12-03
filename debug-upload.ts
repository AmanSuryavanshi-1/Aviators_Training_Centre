import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from docs/.env.local
const envPath = path.join(process.cwd(), 'docs', '.env.local');
console.log(`Loading env from: ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    console.log('Found keys in .env.local:', Object.keys(envConfig));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error('Error: docs/.env.local not found');
    process.exit(1);
}

// Debug: Check if variables are loaded (Masked)
const cloudName = process.env.Cloud_Name;
const apiKey = process.env.API_Key;
const apiSecret = process.env.API_Secret;

console.log('Cloud Name:', cloudName ? `${cloudName.substring(0, 3)}***` : 'UNDEFINED');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 3)}***` : 'UNDEFINED');
console.log('API Secret:', apiSecret ? '*** (Present)' : 'UNDEFINED');

if (!cloudName || !apiKey || !apiSecret) {
    console.error("MISSING CREDENTIALS! Please check docs/.env.local variable names.");
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

const ASSETS_DIR = path.join(process.cwd(), 'docs', 'Docs_Assets');
// Try uploading just one file
const testFile = 'ASSET-20 AvaitorsTrainingCenter_LighthouseScores.png';
const filePath = path.join(ASSETS_DIR, testFile);

async function testUpload() {
    if (!fs.existsSync(filePath)) {
        console.error(`Test file not found: ${filePath}`);
        return;
    }

    console.log(`Attempting to upload ${testFile}...`);
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'aviators-training-centre/debug-test',
        });
        console.log('SUCCESS!');
        console.log('URL:', result.secure_url);
    } catch (error) {
        console.error('UPLOAD FAILED!');
        console.error(error);
    }
}

testUpload();
