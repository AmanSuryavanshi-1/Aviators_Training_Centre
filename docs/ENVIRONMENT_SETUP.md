# Environment Setup Guide

This guide helps you set up the required environment variables for the blog system to work properly.

## Required Environment Variables

### 1. Sanity CMS Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# Sanity CMS Configuration - REQUIRED for blog functionality
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Sanity API Token - REQUIRED for write operations (create, update, delete)
SANITY_API_TOKEN=your_sanity_write_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
```

### 2. Firebase Configuration

```bash
# Firebase Configuration - REQUIRED for analytics and contact forms
FIREBASE_API_KEY=AIzaSyAMjXalWzAN-LGKKH2GyQfPldcmdINlxXs
FIREBASE_AUTH_DOMAIN=aviators-training-centre---atc.firebaseapp.com
FIREBASE_DATABASE_URL=https://aviators-training-centre---atc-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_PROJECT_ID=aviators-training-centre---atc
FIREBASE_STORAGE_BUCKET=aviators-training-centre---atc.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=442722479689
FIREBASE_APP_ID=1:442722479689:web:4940526d3e125ce0da1998
FIREBASE_MEASUREMENT_ID=G-ZXKRM0FKZP

# Firebase Admin SDK - REQUIRED for server-side operations
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aviators-training-centre---atc.iam.gserviceaccount.com
```

### 3. Email Service Configuration

```bash
# Resend API Configuration - REQUIRED for contact forms
***REMOVED***e_T9mZYtYh_8bKAa3Qec9QmrFJ5rgUm5KfM
***REMOVED***

# Owner notification emails
***REMOVED***
***REMOVED***
```

### 4. Admin Dashboard Configuration

```bash
# Admin Dashboard Credentials - REQUIRED for admin access
***REMOVED***
***REMOVED***

# Google Analytics 4 Configuration
***REMOVED***
```

### 2. Getting Sanity Credentials

1. **Project ID and Dataset**: 
   - Go to [Sanity Management Console](https://sanity.io/manage)
   - Select your project
   - Find your Project ID in the project settings

2. **API Token**:
   - Go to [Sanity Tokens](https://sanity.io/manage/personal/tokens)
   - Create a new token with "Editor" or "Administrator" permissions
   - Copy the token to your `.env.local` file

### 3. What Happens Without Proper Configuration

If the environment variables are not set:

- ✅ **Blog reading works**: You can view blog posts and listings
- ❌ **Blog writing fails**: Creating, updating, deleting posts won't work
- ⚠️ **Analytics limited**: View counts and engagement tracking will be skipped
- ⚠️ **Real-time sync disabled**: Changes won't sync automatically

### 4. Development vs Production

**Development (.env.local)**:
```bash
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production**:
```bash
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 5. Troubleshooting

**Error: "SANITY_API_TOKEN is required"**
- Solution: Add the `SANITY_API_TOKEN` to your `.env.local` file
- The system will gracefully skip write operations if the token is missing

**Error: "Unauthorized"**
- Solution: Ensure your API token has "Editor" or "Administrator" permissions

**Error: "Project not found"**
- Solution: Verify your `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct

### 6. Security Notes

- Never commit `.env.local` to version control
- Use different tokens for development and production
- Regularly rotate your API tokens
- Use the minimum required permissions for each token

### 7. Testing Your Setup

Run this command to validate your Sanity configuration:

```bash
npm run validate-sanity
```

Or check the browser console when visiting a blog post - you should see:
- ✅ "Blog post loaded successfully" (if reading works)
- ⚠️ "SANITY_API_TOKEN not configured" (if token is missing)