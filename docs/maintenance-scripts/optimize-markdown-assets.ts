import * as fs from 'fs';
import * as path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const MARKDOWN_FILES = [
    'aviators-training-centre-technical-documentation.md',
    'aviators-training-centre-executive-summary.md',
    'aviators-training-centre-interview-prep.md',
];

// The transformation string to inject
// f_auto: auto format (webp/avif)
// q_auto: auto quality
// w_1600: max width 1600px
// c_limit: don't upscale
const TRANSFORMATION = 'f_auto,q_auto,w_1600,c_limit';

async function optimizeAssets() {
    try {
        for (const docFile of MARKDOWN_FILES) {
            const docPath = path.join(DOCS_DIR, docFile);
            if (!fs.existsSync(docPath)) {
                console.log(`Skipping ${docFile} (not found)`);
                continue;
            }

            let content = fs.readFileSync(docPath, 'utf-8');
            let updated = false;

            // Regex to find Cloudinary URLs
            // Matches: https://res.cloudinary.com/<cloud_name>/image/upload/<optional_transformations>/v<version>/<path>
            // We want to replace <optional_transformations> or insert if missing.

            // Strategy:
            // 1. Find all Cloudinary URLs.
            // 2. Check if they already have the desired transformation.
            // 3. If not, inject/replace it.

            // Example URL: https://res.cloudinary.com/dr0lrme36/image/upload/v1764768008/aviators-training-centre/docs-assets/ASSET-1_...
            // Target:      https://res.cloudinary.com/dr0lrme36/image/upload/f_auto,q_auto,w_1600,c_limit/v1764768008/...

            // Regex breakdown:
            // (https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)  -> Group 1: Prefix
            // (?:[^\/]+\/)?                                              -> Optional existing transformations (non-capturing, or we can capture to replace)
            // (v\d+\/.*)                                                  -> Group 2: Version and path

            // Wait, "upload/" is followed by either "v123..." OR "transformations/v123..."
            // So we look for "upload/"
            // Then we look for "v" followed by digits.
            // Everything in between is the transformation area.

            const regex = /(https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(?:([^\/]+)\/)?(v\d+\/.*)/gi;

            content = content.replace(regex, (match, prefix, existingTransform, rest) => {
                // prefix: https://res.cloudinary.com/dr0lrme36/image/upload/
                // existingTransform: undefined or something like "w_500"
                // rest: v1764768008/aviators-training-centre/docs-assets/ASSET-1...

                // If existingTransform matches our target, do nothing
                if (existingTransform === TRANSFORMATION) {
                    return match;
                }

                // If there are other transformations, we might want to preserve them?
                // For this task, we want to ENFORCE our optimization. 
                // If there was a specific crop, we might break it.
                // But looking at the previous steps, we just uploaded raw images.
                // So replacing is safer to ensure consistency.

                console.log(`Optimizing URL in ${docFile}`);
                updated = true;
                return `${prefix}${TRANSFORMATION}/${rest}`;
            });

            if (updated) {
                fs.writeFileSync(docPath, content, 'utf-8');
                console.log(`Saved optimized updates to ${docFile}`);
            } else {
                console.log(`No changes needed for ${docFile}`);
            }
        }

        console.log("Optimization completed!");

    } catch (error) {
        console.error("Error optimizing assets:", error);
    }
}

optimizeAssets();
