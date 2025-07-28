import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

async function updateImports() {
  console.log('Starting import path updates...');
  
  // Find all TypeScript and JavaScript files
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });
  
  let totalUpdates = 0;
  
  for (const file of files) {
    try {
      let content = await fs.readFile(file, 'utf-8');
      const originalContent = content;
      
      // Update import paths
      // Fix relative imports that now need to go up more levels
      content = content.replace(/from ['"]\.\.\/app\//g, 'from "../app/');
      content = content.replace(/from ['"]\.\.\/components\//g, 'from "../components/');
      content = content.replace(/from ['"]\.\.\/lib\//g, 'from "../lib/');
      content = content.replace(/from ['"]\.\.\/hooks\//g, 'from "../hooks/');
      
      // Update imports to use @ alias for cleaner paths
      content = content.replace(/from ['"]\.\.\/\.\.\/app\//g, 'from "@/app/');
      content = content.replace(/from ['"]\.\.\/\.\.\/components\//g, 'from "@/components/');
      content = content.replace(/from ['"]\.\.\/\.\.\/lib\//g, 'from "@/lib/');
      content = content.replace(/from ['"]\.\.\/\.\.\/hooks\//g, 'from "@/hooks/');
      content = content.replace(/from ['"]\.\.\/\.\.\/types\//g, 'from "@/types/');
      
      // Update deeper relative imports
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/app\//g, 'from "@/app/');
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\//g, 'from "@/components/');
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/lib\//g, 'from "@/lib/');
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, 'from "@/hooks/');
      
      // Update feature-based component imports
      content = content.replace(/from ['"]@\/components\/blog\//g, 'from "@/components/features/blog/');
      content = content.replace(/from ['"]@\/components\/admin\//g, 'from "@/components/features/admin/');
      content = content.replace(/from ['"]@\/components\/contact\//g, 'from "@/components/features/contact/');
      content = content.replace(/from ['"]@\/components\/home\//g, 'from "@/components/features/courses/');
      content = content.replace(/from ['"]@\/components\/about\//g, 'from "@/components/features/courses/');
      content = content.replace(/from ['"]@\/components\/lead-generation\//g, 'from "@/components/features/lead-generation/');
      
      // Update relative imports within the same feature
      content = content.replace(/from ['"]\.\.\/blog\//g, 'from "../features/blog/');
      content = content.replace(/from ['"]\.\.\/admin\//g, 'from "../features/admin/');
      content = content.replace(/from ['"]\.\.\/contact\//g, 'from "../features/contact/');
      content = content.replace(/from ['"]\.\.\/home\//g, 'from "../features/courses/');
      content = content.replace(/from ['"]\.\.\/about\//g, 'from "../features/courses/');
      content = content.replace(/from ['"]\.\.\/lead-generation\//g, 'from "../features/lead-generation/');
      
      // Update imports from components root
      content = content.replace(/from ['"]\.\/blog\//g, 'from "./features/blog/');
      content = content.replace(/from ['"]\.\/admin\//g, 'from "./features/admin/');
      content = content.replace(/from ['"]\.\/contact\//g, 'from "./features/contact/');
      content = content.replace(/from ['"]\.\/home\//g, 'from "./features/courses/');
      content = content.replace(/from ['"]\.\/about\//g, 'from "./features/courses/');
      content = content.replace(/from ['"]\.\/lead-generation\//g, 'from "./features/lead-generation/');
      
      if (content !== originalContent) {
        await fs.writeFile(file, content);
        totalUpdates++;
        console.log(`Updated imports in: ${file}`);
      }
    } catch (error) {
      console.error(`Error updating ${file}:`, error);
    }
  }
  
  console.log(`Import update complete. Updated ${totalUpdates} files.`);
}

updateImports().catch(console.error);