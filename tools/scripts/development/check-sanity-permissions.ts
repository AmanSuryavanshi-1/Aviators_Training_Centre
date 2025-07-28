#!/usr/bin/env node

/**
 * Script to check and diagnose Sanity API token permissions
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@sanity/client';

async function checkSanityPermissions() {
  console.log('🔐 Checking Sanity API Token Permissions');
  console.log('='.repeat(50));

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false
  });

  const permissions = {
    read: false,
    create: false,
    update: false,
    delete: false
  };

  // Test read permissions
  try {
    await client.fetch('*[_type == "post"][0]._id');
    permissions.read = true;
    console.log('✅ READ permissions: Working');
  } catch (error) {
    console.log(`❌ READ permissions: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test create permissions
  try {
    const testDoc = {
      _type: 'post',
      title: `Permission Test - ${new Date().toISOString()}`,
      slug: { current: `permission-test-${Date.now()}` },
      excerpt: 'This is a test document for permission validation',
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Test content' }]
        }
      ],
      publishedAt: new Date().toISOString(),
      featured: false,
      readingTime: 1,
      isPermissionTest: true
    };

    const created = await client.create(testDoc);
    permissions.create = true;
    console.log('✅ CREATE permissions: Working');

    // Test update permissions
    try {
      await client.patch(created._id).set({ title: `${testDoc.title} - Updated` }).commit();
      permissions.update = true;
      console.log('✅ UPDATE permissions: Working');
    } catch (updateError) {
      console.log(`❌ UPDATE permissions: Failed - ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
    }

    // Test delete permissions
    try {
      await client.delete(created._id);
      permissions.delete = true;
      console.log('✅ DELETE permissions: Working');
    } catch (deleteError) {
      console.log(`❌ DELETE permissions: Failed - ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
    }

  } catch (createError) {
    console.log(`❌ CREATE permissions: Failed - ${createError instanceof Error ? createError.message : 'Unknown error'}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Permission Summary:');
  console.log(`Read: ${permissions.read ? '✅' : '❌'}`);
  console.log(`Create: ${permissions.create ? '✅' : '❌'}`);
  console.log(`Update: ${permissions.update ? '✅' : '❌'}`);
  console.log(`Delete: ${permissions.delete ? '✅' : '❌'}`);

  const hasAllPermissions = Object.values(permissions).every(p => p);
  
  if (hasAllPermissions) {
    console.log('\n🎉 All permissions are working correctly!');
  } else {
    console.log('\n🚨 Some permissions are missing. Here\'s how to fix it:');
    console.log('\n🔧 Steps to fix permissions:');
    console.log('1. Go to https://sanity.io/manage');
    console.log('2. Select your project');
    console.log('3. Go to API → Tokens');
    console.log('4. Find your current token or create a new one');
    console.log('5. Make sure it has "Editor" or "Administrator" permissions');
    console.log('6. Update your .env.local file with the new token');
    console.log('\n💡 Note: "Viewer" permissions only allow reading, not writing.');
  }

  return hasAllPermissions;
}

// Run the permission check
checkSanityPermissions().catch(error => {
  console.error('❌ Permission check failed:', error);
  process.exit(1);
});