# Sanity Permissions Fix Guide

## Problem
You're getting the error: `transaction failed: Insufficient permissions; permission "create" required`

This means your Sanity API token only has **Viewer** permissions, but you need **Editor** permissions to create blog posts.

## Solution

### Step 1: Go to Sanity Management Console
1. Open your browser and go to: https://sanity.io/manage
2. Sign in to your Sanity account
3. Select your project (Aviators Training Centre)

### Step 2: Navigate to API Tokens
1. In the left sidebar, click on **"API"**
2. Click on **"Tokens"**

### Step 3: Check Current Token Permissions
1. Look for your existing token in the list
2. Check the **"Permissions"** column
3. If it says **"Viewer"**, that's the problem!

### Step 4: Create a New Token with Editor Permissions
1. Click **"Add API token"** button
2. Give it a name like: `Blog Editor Token`
3. **IMPORTANT**: Set permissions to **"Editor"** (not Viewer)
4. Click **"Save"**
5. **Copy the token immediately** (you won't be able to see it again)

### Step 5: Update Your Environment Variables
1. Open your `.env.local` file in the project root
2. Replace the old token with the new one:
   ```
   SANITY_API_TOKEN=your_new_editor_token_here
   ```
3. Save the file

### Step 6: Restart Your Development Server
1. Stop your Next.js development server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 7: Test the Fix
Run the permission test script to verify:
```bash
node test-sanity-permissions.js
```

You should see:
- ✅ Connection successful
- ✅ Read permissions working
- ✅ Create permissions working
- ✅ Category creation working
- ✅ Author creation working

## Alternative: Update Existing Token (if possible)
If you can edit your existing token:
1. Find your current token in the list
2. Click on it to edit
3. Change permissions from **"Viewer"** to **"Editor"**
4. Save the changes

## Security Note
- Editor tokens have more permissions, so keep them secure
- Don't commit them to version control
- Consider using different tokens for development and production

## Verification
After fixing the permissions, try creating a blog post again. The error should be resolved!

## Common Issues
- **Token not found**: Make sure you copied the entire token
- **Still getting errors**: Try deleting the old token and creating a completely new one
- **Environment not loading**: Restart your development server after changing .env.local

## Need Help?
If you're still having issues:
1. Double-check that your token has "Editor" permissions
2. Verify the token is correctly set in .env.local
3. Make sure you restarted the development server
4. Run the test script to diagnose the specific issue