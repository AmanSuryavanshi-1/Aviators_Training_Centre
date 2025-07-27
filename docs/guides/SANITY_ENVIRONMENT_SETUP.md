# Sanity CMS Environment Setup Guide

This guide provides comprehensive instructions for setting up Sanity CMS environment variables and configuration for the blog system.

## 🎯 Overview

The blog system uses Sanity CMS as the single source of truth for all blog content. Proper environment configuration is critical for:
- Admin dashboard functionality
- Blog content display
- CRUD operations
- Real-time synchronization

## 📋 Required Environment Variables

### Core Sanity Configuration

```bash
# Project Configuration - REQUIRED
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# API Token - REQUIRED for write operations
***REMOVED***k_your_editor_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
```

### Optional Configuration

```bash
# Webhook Configuration (for real-time updates)
SANITY_WEBHOOK_SECRET=your_webhook_secret_here

# Studio Configuration
NEXT_PUBLIC_SANITY_STUDIO_URL=https://aviators-training-centre-blog.sanity.studio

# Preview Configuration
SANITY_PREVIEW_SECRET=your_preview_secret_here
```

## 🔧 Step-by-Step Setup

### Step 1: Get Sanity Project Information

1. **Access Sanity Management Console:**
   - Go to https://sanity.io/manage
   - Sign in to your account

2. **Select Your Project:**
   - Find "Aviators Training Centre" project
   - Note the Project ID: `3u4fa9kl`

3. **Verify Dataset:**
   - Ensure you're using the `production` dataset
   - Check that content exists in this dataset

### Step 2: Create API Token

1. **Navigate to API Tokens:**
   - In Sanity management console
   - Click "API" in left sidebar
   - Click "Tokens" tab

2. **Create New Token:**
   - Click "Add API token"
   - **Name:** `Blog Admin Token - [Environment]`
   - **Permissions:** Select "Editor" (CRITICAL)
   - **Dataset:** production
   - Click "Save"

3. **Copy Token:**
   - Copy the generated token immediately
   - Token format: `sk...` (starts with 'sk')
   - Store securely - you won't see it again

### Step 3: Configure Environment Files

#### Development Environment (.env.local)

Create or update `.env.local` in your project root:

```bash
# Sanity CMS Configuration
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_your_development_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional Development Settings
SANITY_PREVIEW_SECRET=development_preview_secret
```

#### Production Environment

For production deployment, set these environment variables in your hosting platform:

```bash
# Required Production Variables
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_your_production_token_here
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in

# Optional Production Settings
SANITY_WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_SANITY_STUDIO_URL=https://aviators-training-centre-blog.sanity.studio
SANITY_PREVIEW_SECRET=your_production_preview_secret
```

### Step 4: Verify Configuration

#### Test Basic Connection

```bash
# Test if environment variables are loaded
node -e "console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)"
node -e "console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)"
node -e "console.log('Token present:', !!process.env.SANITY_API_TOKEN)"
```

#### Test Sanity Connection

```bash
# Test Sanity connectivity
node -e "
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false
});
client.fetch('*[_type == \"post\"] | order(_createdAt desc) [0..2] { title, slug }')
  .then(posts => console.log('✅ Connection successful. Found', posts.length, 'posts'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"
```

#### Test Write Permissions

```bash
# Test token permissions
node scripts/check-sanity-permissions.js
```

Expected output:
```
✅ READ: Success
✅ CREATE: Success
✅ UPDATE: Success
✅ DELETE: Success
```

## 🔐 Security Best Practices

### Token Management

1. **Use Different Tokens for Different Environments:**
   - Development: Limited scope, can be shared with team
   - Staging: Production-like permissions, restricted access
   - Production: Full permissions, highly restricted access

2. **Token Rotation:**
   - Rotate tokens every 90 days
   - Keep backup tokens for emergency access
   - Document token creation and expiry dates

3. **Token Storage:**
   - Never commit tokens to version control
   - Use secure environment variable management
   - Encrypt tokens in CI/CD pipelines

### Environment Security

1. **Environment Isolation:**
   - Separate environments for dev/staging/production
   - Different Sanity projects for different environments (if needed)
   - Isolated access controls

2. **Access Control:**
   - Limit who can access production tokens
   - Use role-based access in Sanity
   - Regular access reviews

## 🚨 Common Issues and Solutions

### Issue 1: "Insufficient permissions" Error

**Cause:** API token has Viewer permissions instead of Editor

**Solution:**
1. Check token permissions in Sanity management console
2. Create new token with Editor permissions
3. Update environment variable
4. Restart application

### Issue 2: "Unauthorized" Error

**Cause:** Invalid or expired API token

**Solution:**
1. Verify token format (should start with 'sk')
2. Check if token exists in Sanity console
3. Generate new token if needed
4. Ensure token is for correct project and dataset

### Issue 3: Environment Variables Not Loading

**Cause:** Incorrect file naming or location

**Solution:**
1. Ensure file is named `.env.local` (note the dot)
2. Place file in project root directory
3. Restart development server
4. Check for syntax errors in env file

### Issue 4: CORS Errors

**Cause:** Domain not configured in Sanity CORS settings

**Solution:**
1. Go to Sanity management console
2. Navigate to API → CORS Origins
3. Add your domain (including protocol)
4. Save configuration

## 🧪 Testing Your Setup

### Automated Tests

Run the comprehensive test suite:

```bash
# Test all Sanity functionality
npm run test:sanity

# Test environment configuration
npm run test:env

# Test blog sync functionality
npm run test:sync
```

### Manual Testing

1. **Admin Dashboard Test:**
   - Navigate to `/admin`
   - Verify blog posts are displayed
   - Try creating a new post
   - Try editing an existing post
   - Try deleting a post

2. **Frontend Test:**
   - Navigate to `/blog`
   - Verify posts are displayed
   - Check individual post pages
   - Verify changes from admin appear immediately

3. **API Test:**
   - Test API endpoints directly
   - Verify proper error handling
   - Check response times

## 📊 Environment Monitoring

### Health Checks

Implement health checks to monitor Sanity connectivity:

```javascript
// /api/health/sanity
export async function GET() {
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false
    });
    
    await client.fetch('*[_type == "post"][0]');
    
    return Response.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
```

### Monitoring Alerts

Set up alerts for:
- Sanity API failures
- Token expiration warnings
- Unusual error rates
- Performance degradation

## 📚 Environment-Specific Configurations

### Development Environment

```bash
# .env.local
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_dev_token_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Development-specific settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### Staging Environment

```bash
# Staging environment variables
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_staging_token_here
NEXT_PUBLIC_SITE_URL=https://staging.aviatorstrainingcentre.com

# Staging-specific settings
NODE_ENV=production
ENABLE_PREVIEW_MODE=true
```

### Production Environment

```bash
# Production environment variables
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_production_token_here
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in

# Production-specific settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
ENABLE_PREVIEW_MODE=false
```

## 🔄 Migration and Updates

### Updating API Version

When updating Sanity API version:

1. **Test in Development:**
   - Update `NEXT_PUBLIC_SANITY_API_VERSION`
   - Test all functionality
   - Check for breaking changes

2. **Update Staging:**
   - Deploy to staging environment
   - Run comprehensive tests
   - Verify no regressions

3. **Update Production:**
   - Schedule maintenance window
   - Update production environment
   - Monitor for issues

### Dataset Migration

If migrating between datasets:

1. **Export Data:**
   ```bash
   sanity dataset export production backup.tar.gz
   ```

2. **Create New Dataset:**
   ```bash
   sanity dataset create new-dataset
   ```

3. **Import Data:**
   ```bash
   sanity dataset import backup.tar.gz new-dataset
   ```

4. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_SANITY_DATASET=new-dataset
   ```

## 📞 Support and Resources

### Internal Resources
- [Sanity Sync Troubleshooting Guide](./SANITY_SYNC_TROUBLESHOOTING.md)
- [Deployment Checklist](./SANITY_DEPLOYMENT_CHECKLIST.md)
- [Blog System Documentation](../BLOG_SYSTEM_README.md)

### External Resources
- [Sanity Documentation](https://www.sanity.io/docs)
- [Environment Variables Guide](https://www.sanity.io/docs/environment-variables)
- [API Reference](https://www.sanity.io/docs/http-api)

### Getting Help
- **Sanity Community:** https://slack.sanity.io
- **Sanity Support:** support@sanity.io
- **Documentation Issues:** Create issue in project repository

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Maintainer:** Development Team