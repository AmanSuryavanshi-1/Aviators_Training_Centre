import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from docs/.env.local
const envPath = path.join(process.cwd(), 'docs', '.env.local');
console.log(`Loading env from: ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('Loaded environment variables.');
} else {
    console.error('Error: docs/.env.local not found');
    process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.API_Key,
    api_secret: process.env.API_Secret,
});

const ASSETS_DIR = path.join(process.cwd(), 'docs', 'Docs_Assets');
const DOCS_DIR = path.join(process.cwd(), 'docs');

// Files to update
const MARKDOWN_FILES = [
    'aviators-training-centre-technical-documentation.md',
    'aviators-training-centre-executive-summary.md',
    'aviators-training-centre-interview-prep.md',
];

async function uploadImage(filePath: string): Promise<string | null> {
    try {
        const fileName = path.basename(filePath);
        console.log(`Uploading ${fileName} (Clean, No Watermark)...`);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'aviators-training-centre/docs-assets',
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });

        console.log(`Uploaded ${fileName} -> ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
        return null;
    }
}

async function main() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Assets directory not found: ${ASSETS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(ASSETS_DIR).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
    const urlMap = new Map<string, string>();

    console.log(`Found ${files.length} images to upload.`);

    // 1. Upload all images
    for (const file of files) {
        const filePath = path.join(ASSETS_DIR, file);
        const url = await uploadImage(filePath);
        if (url) {
            urlMap.set(file, url);
        }
    }

    if (urlMap.size === 0) {
        console.error("No images were uploaded! Aborting markdown update.");
        process.exit(1);
    }

    console.log(`Uploaded ${urlMap.size} images. Updating markdown files...`);

    // 2. Update markdown files
    for (const docFile of MARKDOWN_FILES) {
        const docPath = path.join(DOCS_DIR, docFile);
        if (!fs.existsSync(docPath)) {
            console.warn(`Document not found: ${docPath}`);
            continue;
        }

        let content = fs.readFileSync(docPath, 'utf-8');
        let updated = false;

        for (const [fileName, url] of urlMap.entries()) {
            // Regex to match: 
            // 1. Existing Cloudinary URLs (https://.../FILENAME)
            // 2. Local paths (./Docs_Assets/FILENAME or Docs_Assets/FILENAME)

            const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Match encoded (%20), unencoded spaces, AND underscores (Cloudinary sanitization)
            const fileNamePattern = escapedFileName.replace(/ /g, '(?: |%20|_)');

            // Match any http/https URL ending with the filename, OR local paths
            const regex = new RegExp(`(?:https?:\\/\\/[^\\s)"']+\\/|\\.\\/Docs_Assets\\/|Docs_Assets\\/)${fileNamePattern}`, 'g');

            if (regex.test(content)) {
                content = content.replace(regex, url);
                updated = true;
                console.log(`Updated references to ${fileName} in ${docFile}`);
            }
        }

        if (updated) {
            fs.writeFileSync(docPath, content, 'utf-8');
            console.log(`Saved updates to ${docFile}`);
        } else {
            console.log(`No changes needed for ${docFile}`);
        }
    }

    console.log('Migration completed successfully!');
}

main().catch(console.error);
