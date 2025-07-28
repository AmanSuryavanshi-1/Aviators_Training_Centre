#!/usr/bin/env node

/**
 * Script to upload all blog images from public/Blogs/ to Sanity CMS
 * This ensures all images are properly stored in Sanity and can be referenced correctly
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function uploadBlogImages() {
  log('\n🚀 Blog Images Upload to Sanity', 'bold');
  log('='.repeat(50), 'blue');

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    logError('NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment variables');
    process.exit(1);
  }

  if (!process.env.SANITY_API_TOKEN) {
    logError('SANITY_API_TOKEN is not set in environment variables');
    logError('You need an API token with Editor permissions to upload images');
    process.exit(1);
  }

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false
  });

  // Test connection
  try {
    await client.fetch('*[_type == "post"][0]');
    logSuccess('Connected to Sanity successfully');
  } catch (error) {
    logError(`Failed to connect to Sanity: ${error.message}`);
    process.exit(1);
  }

  // Define blog images directory
  const blogsDir = path.join(process.cwd(), 'public', 'Blogs');
  
  if (!fs.existsSync(blogsDir)) {
    logError(`Blogs directory not found: ${blogsDir}`);
    process.exit(1);
  }

  // Get all image files
  const imageFiles = fs.readdirSync(blogsDir)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .sort();

  if (imageFiles.length === 0) {
    logWarning('No image files found in public/Blogs/ directory');
    process.exit(0);
  }

  logInfo(`Found ${imageFiles.length} image files to upload`);
  
  const uploadResults = [];
  let successCount = 0;
  let errorCount = 0;

  for (const fileName of imageFiles) {
    const filePath = path.join(blogsDir, fileName);
    
    try {
      logInfo(`Uploading ${fileName}...`);
      
      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileStats = fs.statSync(filePath);
      
      // Check file size (max 10MB for Sanity)
      if (fileStats.size > 10 * 1024 * 1024) {
        logWarning(`Skipping ${fileName} - file too large (${Math.round(fileStats.size / 1024 / 1024)}MB)`);
        continue;
      }

      // Determine content type
      const ext = path.extname(fileName).toLowerCase();
      const contentTypeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
      };
      const contentType = contentTypeMap[ext] || 'image/jpeg';

      // Upload to Sanity
      const uploadedAsset = await client.assets.upload('image', fileBuffer, {
        filename: fileName,
        contentType: contentType,
      });

      uploadResults.push({
        fileName,
        assetId: uploadedAsset._id,
        url: uploadedAsset.url,
        size: fileStats.size,
        success: true
      });

      logSuccess(`Uploaded ${fileName} → ${uploadedAsset._id}`);
      successCount++;

    } catch (error) {
      logError(`Failed to upload ${fileName}: ${error.message}`);
      uploadResults.push({
        fileName,
        error: error.message,
        success: false
      });
      errorCount++;
    }
  }

  // Generate summary report
  log('\n📊 Upload Summary', 'bold');
  log('='.repeat(30), 'blue');
  logSuccess(`Successfully uploaded: ${successCount} images`);
  if (errorCount > 0) {
    logError(`Failed uploads: ${errorCount} images`);
  }

  // Generate mapping file for reference
  if (successCount > 0) {
    const mappingFile = path.join(process.cwd(), 'sanity-image-mapping.json');
    const mapping = {};
    
    uploadResults
      .filter(result => result.success)
      .forEach(result => {
        const originalPath = `/Blogs/${result.fileName}`;
        mapping[originalPath] = {
          assetId: result.assetId,
          url: result.url,
          fileName: result.fileName,
          uploadedAt: new Date().toISOString()
        };
      });

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    logSuccess(`Created image mapping file: ${mappingFile}`);
    
    log('\n📋 Usage Instructions:', 'bold');
    logInfo('1. The mapping file contains the Sanity asset IDs for each image');
    logInfo('2. Use the asset IDs in your blog posts instead of file paths');
    logInfo('3. Example: Instead of "/Blogs/Blog3.webp", use the asset ID from the mapping');
  }

  // Show detailed results
  if (uploadResults.length > 0) {
    log('\n📝 Detailed Results:', 'bold');
    uploadResults.forEach(result => {
      if (result.success) {
        log(`✅ ${result.fileName} → ${result.assetId}`, 'green');
      } else {
        log(`❌ ${result.fileName} → ${result.error}`, 'red');
      }
    });
  }

  log('\n🎉 Upload process completed!', 'bold');
  
  if (successCount > 0) {
    log('\nNext steps:', 'blue');
    logInfo('1. Check the sanity-image-mapping.json file for asset IDs');
    logInfo('2. Update your blog editor to use these asset IDs');
    logInfo('3. Test creating a new blog post with the uploaded images');
  }
}

// Run the upload process
uploadBlogImages().catch(error => {
  logError(`Upload process failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});