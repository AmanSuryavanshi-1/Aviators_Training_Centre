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
const ASSETS_DIR = path.join(process.cwd(), 'docs', 'Docs_Assets');
const MARKDOWN_FILES = [
    'aviators-training-centre-technical-documentation.md',
    'aviators-training-centre-executive-summary.md',
    'aviators-training-centre-interview-prep.md',
];

async function recoverAssets() {
    try {
        console.log("Fetching resources from Cloudinary...");
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'aviators-training-centre/docs-assets',
            max_results: 500,
        });

        // Map ASSET-XX -> Cloudinary URL
        const assetIdToUrl = new Map<string, string>();
        for (const resource of result.resources) {
            const parts = resource.public_id.split('/');
            const filename = parts[parts.length - 1];
            const match = filename.match(/^(ASSET-\d+)/);
            if (match) {
                assetIdToUrl.set(match[1], resource.secure_url);
            }
        }
        console.log(`Mapped ${assetIdToUrl.size} Cloudinary assets.`);

        // Get local files to map Filename -> ASSET-XX
        const localFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.startsWith('ASSET-'));
        // Map: "Homepage Screenshot" (normalized) -> "ASSET-13"
        const textToAssetId = new Map<string, string>();

        for (const file of localFiles) {
            const match = file.match(/^(ASSET-\d+)\s+(.+)\.[^.]+$/);
            if (match) {
                const assetId = match[1];
                const description = match[2].toLowerCase().trim();
                textToAssetId.set(description, assetId);
                // Also map the assetId itself just in case
                textToAssetId.set(assetId.toLowerCase(), assetId);
            }
        }

        // Helper to find best matching asset ID for a given Alt Text
        function findAssetIdForAltText(altText: string): string | null {
            const normalizedAlt = altText.toLowerCase().trim();

            // 1. Exact match
            if (textToAssetId.has(normalizedAlt)) {
                return textToAssetId.get(normalizedAlt)!;
            }

            // 2. Contains match (Local filename contains Alt Text)
            // e.g. Alt="Homepage Screenshot" -> File="ASSET-13 Homepage Screenshot.png"
            for (const file of localFiles) {
                if (file.toLowerCase().includes(normalizedAlt)) {
                    const match = file.match(/^(ASSET-\d+)/);
                    if (match) return match[1];
                }
            }

            // 3. Reverse Contains match (Alt Text contains Local filename description)
            // e.g. Alt="The Homepage Screenshot" -> File="ASSET-13 Homepage Screenshot.png"
            for (const [desc, assetId] of textToAssetId.entries()) {
                if (normalizedAlt.includes(desc)) {
                    return assetId;
                }
            }

            return null;
        }

        // Process Markdown
        for (const docFile of MARKDOWN_FILES) {
            const docPath = path.join(DOCS_DIR, docFile);
            if (!fs.existsSync(docPath)) continue;

            let content = fs.readFileSync(docPath, 'utf-8');
            let updated = false;

            // Replace Markdown Images: ![Alt](URL)
            content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
                if (!alt) return match;
                const assetId = findAssetIdForAltText(alt);
                if (assetId && assetIdToUrl.has(assetId)) {
                    const newUrl = assetIdToUrl.get(assetId)!;
                    if (url !== newUrl) {
                        console.log(`[${docFile}] Fixing MD Link: "${alt}" -> ${assetId} -> ${newUrl}`);
                        updated = true;
                        return `![${alt}](${newUrl})`;
                    }
                }
                return match;
            });

            // Replace HTML Images: <img src="URL" alt="Alt" ...>
            content = content.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g, (match, beforeSrc, src, afterSrc) => {
                const altMatch = (beforeSrc + afterSrc).match(/alt=["']([^"']+)["']/);
                if (altMatch) {
                    const alt = altMatch[1];
                    const assetId = findAssetIdForAltText(alt);
                    if (assetId && assetIdToUrl.has(assetId)) {
                        const newUrl = assetIdToUrl.get(assetId)!;
                        if (src !== newUrl) {
                            console.log(`[${docFile}] Fixing HTML Img: "${alt}" -> ${assetId} -> ${newUrl}`);
                            updated = true;
                            return `<img ${beforeSrc}src="${newUrl}"${afterSrc}>`;
                        }
                    }
                }
                return match;
            });

            if (updated) {
                fs.writeFileSync(docPath, content, 'utf-8');
                console.log(`Saved recovered updates to ${docFile}`);
            } else {
                console.log(`No recovery needed for ${docFile}`);
            }
        }

        console.log("Recovery completed!");

    } catch (error) {
        console.error("Error recovering assets:", error);
    }
}

recoverAssets();
