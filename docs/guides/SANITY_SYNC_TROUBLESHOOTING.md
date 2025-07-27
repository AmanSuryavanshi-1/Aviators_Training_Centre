# Sanity CMS Sync Troubleshooting Guide

This guide helps resolve common synchronization issues between the Sanity CMS admin dashboard and the blog frontend.

## 🚨 Common Issues and Solutions

### 1. Admin Dashboard Shows Zero Blogs

**Symptoms:**
- Admin dashboard displays "No blog posts found"
- Blog frontend shows content from other sources
- CRUD operations don't reflect on frontend

**Root Cause:** System is using multiple data sources (Sanity + markdown files) but admin only manages Sanity content.

**Solution:**
1. Verify Sanity connection:
   ```bash
   node scripts/check-sanity-permissions.js
   ```

2. Check if posts exist in Sanity:
   ```bash
   node -e "
   const { createClient } = require('@sanity/client');
   const client = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
     apiVersion: '2024-01-01',
     token: process.env.SANITY_API_TOKEN,
     useCdn: false
   });
   client.fetch('*[_type == \"post\"]').then(posts => console.log('Posts in Sanity:', posts.length));
   "
   ```

3. If no posts exist, migrate existing content:
   ```bash
   npm run migrate:blog
   ```

### 2. Permission Errors

**Symptoms:**
- Error: "Insufficient permissions; permission 'create' required"
- Error: "Unauthorized"
- Error: "permission 'update' required"

**Root Cause:** Sanity API token has insufficient permissions.

**Solution:**
1. **Check Current Token Permissions:**
   - Go to https://sanity.io/manage
   - Select your project
   - Navigate to API → Tokens
   - Check permissions column

2. **Create New Token with Proper Permissions:**
   - Click "Add API token"
   - Name: "Blog Admin Token"
   - **Important:** Select "Editor" or "Administrator" permissions
   - Copy the token immediately

3. **Update Environment Variables:**
   ```bash
   # In .env.local
   SANITY_API_TOKEN=your_new_editor_token_here
   ```

4. **Restart Development Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### 3. Connection Issues

**Symptoms:**
- Error: "Failed to fetch from Sanity"
- Timeout errors
- Network connection errors

**Root Cause:** Network issues, incorrect project ID, or API configuration problems.

**Solution:**
1. **Verify Environment Variables:**
   ```bash
   # Check your .env.local file contains:
   ***REMOVED***
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
   ***REMOVED***k...
   ```

2. **Test Connection:**
   ```bash
   node -e "
   const { createClient } = require('@sanity/client');
   const client = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
     apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
     useCdn: false
   });
   client.fetch('*[_type == \"post\"][0]').then(post => console.log('Connection successful:', !!post)).catch(err => console.error('Connection failed:', err.message));
   "
   ```

3. **Check Network and Firewall:**
   - Ensure access to `*.sanity.io` domains
   - Check corporate firewall settings
   - Try from different network if possible

### 4. Cache Issues

**Symptoms:**
- Changes in admin don't appear on frontend immediately
- Stale data displayed
- Inconsistent content between pages

**Root Cause:** Caching layers not properly invalidated after content changes.

**Solution:**
1. **Manual Cache Invalidation:**
   ```bash
   # Clear Next.js cache
   rm -rf .next/cache
   npm run dev
   ```

2. **API Cache Invalidation:**
   ```bash
   curl -X POST http://localhost:3000/api/blog/cache/invalidate
   ```

3. **Check Cache Configuration:**
   - Verify cache invalidation hooks are working
   - Check if ISR (Incremental Static Regeneration) is properly configured
   - Review cache TTL settings

### 5. Data Synchronization Issues

**Symptoms:**
- Admin shows different data than frontend
- CRUD operations don't reflect immediately
- Inconsistent post counts

**Root Cause:** Multiple data sources or caching issues.

**Solution:**
1. **Verify Single Data Source:**
   - Ensure all API endpoints use only Sanity
   - Remove markdown fallback logic
   - Check unified blog service configuration

2. **Test End-to-End Sync:**
   ```bash
   # Run comprehensive sync tests
   npm run test:sync
   ```

3. **Manual Sync Verification:**
   - Create a test post in admin
   - Check if it appears on blog listing immediately
   - Verify individual post page loads correctly
   - Test edit and delete operations

## 🔧 Diagnostic Commands

### Quick Health Check
```bash
# Run all diagnostic checks
node scripts/sanity-health-check.js
```

### Detailed Connection Test
```bash
# Test all Sanity operations
node scripts/test-sanity-operations.js
```

### Permission Verification
```bash
# Check token permissions
node scripts/check-sanity-permissions.js
```

### Cache Status Check
```bash
# Check cache status
curl http://localhost:3000/api/blog/health
```

## 🚀 Prevention Best Practices

### 1. Environment Configuration
- Always use Editor-level tokens for write operations
- Keep tokens secure and rotate regularly
- Use different tokens for development and production
- Document token permissions and expiry dates

### 2. Error Handling
- Implement proper error boundaries in React components
- Add retry logic for network operations
- Provide user-friendly error messages
- Log errors for debugging

### 3. Monitoring
- Set up health checks for Sanity connectivity
- Monitor API response times
- Track error rates and types
- Alert on sync failures

### 4. Testing
- Run sync tests before deployments
- Test with different network conditions
- Verify error handling scenarios
- Test cache invalidation workflows

## 📞 Getting Help

### Self-Service Resources
1. **Sanity Documentation:** https://www.sanity.io/docs
2. **API Reference:** https://www.sanity.io/docs/http-api
3. **Community Forum:** https://www.sanity.io/community

### Internal Resources
1. **Project Documentation:** `docs/BLOG_SYSTEM_README.md`
2. **API Documentation:** `app/api/blog/README.md`
3. **Error Handling Guide:** `docs/ERROR_HANDLING_GUIDE.md`

### Emergency Contacts
- **Technical Lead:** [Your technical lead contact]
- **DevOps Team:** [Your DevOps team contact]
- **Sanity Support:** support@sanity.io (for platform issues)

## 📋 Troubleshooting Checklist

Before reporting issues, please complete this checklist:

- [ ] Verified environment variables are correct
- [ ] Confirmed Sanity token has proper permissions
- [ ] Tested network connectivity to Sanity
- [ ] Cleared local caches and restarted server
- [ ] Ran diagnostic commands
- [ ] Checked error logs for specific error messages
- [ ] Tested with a fresh browser session
- [ ] Verified issue persists across different devices/networks

## 🔄 Recovery Procedures

### Complete System Reset
If all else fails, follow these steps for a complete reset:

1. **Backup Current Data:**
   ```bash
   node scripts/backup-sanity-data.js
   ```

2. **Clear All Caches:**
   ```bash
   rm -rf .next/cache
   rm -rf node_modules/.cache
   ```

3. **Regenerate API Token:**
   - Create new token in Sanity management console
   - Update .env.local with new token
   - Test permissions

4. **Restart Everything:**
   ```bash
   npm install
   npm run dev
   ```

5. **Verify Functionality:**
   ```bash
   npm run test:sync
   ```

### Data Recovery
If data is lost or corrupted:

1. **Check Sanity History:**
   - Use Sanity Studio's document history feature
   - Restore from previous versions if needed

2. **Restore from Backup:**
   ```bash
   node scripts/restore-sanity-data.js backup-file.json
   ```

3. **Re-migrate Content:**
   ```bash
   npm run migrate:blog --force
   ```

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Maintainer:** Development Team