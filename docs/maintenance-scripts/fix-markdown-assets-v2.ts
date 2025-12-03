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

const DOCS_DIR = path.join(process.cwd(), 'docs');
const MARKDOWN_FILES = [
    'aviators-training-centre-technical-documentation.md',
    'aviators-training-centre-executive-summary.md',
    'aviators-training-centre-interview-prep.md',
];

async function fixMarkdown() {
    try {
        console.log("Fetching resources from Cloudinary...");

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'aviators-training-centre/docs-assets',
            max_results: 500,
        });

        console.log(`Found ${result.resources.length} assets.`);

        const assetMap = new Map<string, string>();

        for (const resource of result.resources) {
            const publicIdParts = resource.public_id.split('/');
            const filenameWithUnderscores = publicIdParts[publicIdParts.length - 1];

            const match = filenameWithUnderscores.match(/^(ASSET-\d+)/);
            if (match) {
                const assetPrefix = match[1];
                assetMap.set(assetPrefix, resource.secure_url);
            } else {
                assetMap.set(filenameWithUnderscores, resource.secure_url);
            }
        }

        // CRITICAL: Sort keys by length descending to avoid substring matching issues
        const sortedKeys = Array.from(assetMap.keys()).sort((a, b) => b.length - a.length);

        for (const docFile of MARKDOWN_FILES) {
            const docPath = path.join(DOCS_DIR, docFile);
            if (!fs.existsSync(docPath)) continue;

            let content = fs.readFileSync(docPath, 'utf-8');
            let updated = false;

            for (const key of sortedKeys) {
                const correctUrl = assetMap.get(key)!;

                const regex = new RegExp(`(?:https?:\\/\\/[^\\s"']+|\\.\\/[^\\s"']+|\\/[^\\s"']+)?${key}[^\\s"']*(?:\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp)`, 'gi');

                if (regex.test(content)) {
                    content = content.replace(regex, (match) => {
                        if (match === correctUrl) return match;

                        const index = match.indexOf(key);
                        if (index === -1) return match;

                        const charAfter = match[index + key.length];
                        if (charAfter && /\d/.test(charAfter)) {
                            return match;
                        }

                        console.log(`Replacing in ${docFile}:`);
                        console.log(`  Key: ${key}`);
                        console.log(`  Old: ${match}`);
                        console.log(`  New: ${correctUrl}`);
                        updated = true;
                        return correctUrl;
                    });
                }
            }

            if (updated) {
                fs.writeFileSync(docPath, content, 'utf-8');
                console.log(`Saved updates to ${docFile}`);
            } else {
                console.log(`No changes for ${docFile}`);
            }
        }

        console.log("Fix v2 completed!");

    } catch (error) {
        console.error("Error fixing markdown:", error);
    }
}

fixMarkdown();
