# Sanity API Token Setup Guide

Your blog deletion issue is caused by insufficient permissions on your Sanity API token. Here's how to fix it:

## 🔧 Quick Fix Steps

### 1. Get a New API Token with Proper Permissions

1. **Go to Sanity Management Console**
   - Visit: https://sanity.io/manage
   - Log in to your account

2. **Select Your Project**
   - Find and click on your project: `aviators-training-centre-atc` (ID: 3u4fa9kl)

3. **Navigate to API Tokens**
   - Click on "API" in the left sidebar
   - Click on "Tokens" tab

4. **Create New Token**
   - Click "Add API token"
   - Give it a name: `Blog Admin Token`
   - **Important**: Select "Editor" or "Administrator" permissions
   - Make sure it's for the "production" dataset
   - Click "Save"

5. **Copy the Token**
   - Copy the generated token (it starts with `sk...`)
   - **Important**: Save it immediately - you won't see it again!

### 2. Update Your Environment File

Replace the `SANITY_API_TOKEN` in your `.env.local` file:

```bash
# Replace this line in .env.local
SANITY_API_TOKEN=your_new_token_here
```

### 3. Test the New Token

Run this command to test your new token:

```bash
node scripts/check-sanity-permissions.js
```

You should see all permission tests pass:
- ✅ READ: Success
- ✅ CREATE: Success  
- ✅ UPDATE: Success
- ✅ DELETE: Success

## 🗑️ Bulk Delete All Existing Blogs

Once your token is working, delete all 35 existing blogs:

```bash
node scripts/bulk-delete-blogs.js
```

This will:
1. Show you all blogs to be deleted
2. Ask for confirmation
3. Delete them in batches
4. Show a summary of results

## 🔍 Current Token Analysis

Your current token appears to have only READ permissions, which is why you can see blogs but can't delete them.

## ⚠️ Common Issues

### "Insufficient permissions" Error
- Your token doesn't have write permissions
- Solution: Create new token with "Editor" role

### "permission 'update' required" Error  
- Sanity requires UPDATE permission to DELETE documents
- Solution: Ensure token has "Editor" or "Administrator" role

### "Unauthorized" Error
- Token is invalid or expired
- Solution: Generate a new token

## 🎯 After Setup

Once you have the proper token:
1. All 35 existing blogs will be deletable
2. You can bulk delete them using the script
3. Your admin panel delete buttons will work
4. You can start fresh with your new markdown blogs

## 📞 Need Help?

If you're still having issues:
1. Check that the token is for the correct project (3u4fa9kl)
2. Verify it's for the "production" dataset
3. Make sure you copied the full token (starts with `sk`)
4. Restart your development server after updating .env.local

The token permissions are the root cause of your deletion issues. Once fixed, everything should work smoothly!