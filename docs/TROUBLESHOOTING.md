# Sanity Studio Deployment Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and fix common issues with Sanity Studio deployment and authentication.

## Quick Diagnosis

Use this flowchart to quickly identify your issue:

```
Studio won't load at all?
├─ Yes → Check CORS Configuration (Section 1)
└─ No
   └─ Studio loads but can't authenticate?
      ├─ Yes → Check Authentication Issues (Section 2)
      └─ No
         └─ Studio works but admin navigation fails?
            ├─ Yes → Check Navigation Issues (Section 3)
            └─ No → Check Environment Configuration (Section 4)
```

## Section 1: CORS Configuration Issues

### Symptoms
- ❌ Studio shows "Before you continue..." message
- ❌ "CORS origin not allowed" errors
- ❌ Studio interface doesn't load
- ❌ Blank white screen

### Diagnosis Steps

1. **Check Browser Console**
   ```
   Open Developer Tools (F12) → Console tab
   Look for: "blocked by CORS policy" errors
   ```

2. **Verify Current CORS Settings**
   - Go to [Sanity Management Console](https://www.sanity.io/manage/personal/project/3u4fa9kl/api)
   - Check if your domain is listed in CORS origins
   - Verify "Allow credentials" is enabled

3. **Test CORS Manually**
   ```javascript
   // Run in browser console on your site
   fetch('https://3u4fa9kl.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="post"][0]', {
     credentials: 'include'
   })
   .then(r => console.log('✅ CORS OK'))
   .catch(e => console.error('❌ CORS Failed:', e));
   ```

### Solutions

#### Fix 1: Add Missing CORS Origins
1. Go to Sanity Management Console
2. Navigate to API → CORS Origins
3. Add these origins:
   ```
   https://www.aviatorstrainingcentre.in
   https://aviatorstrainingcentre.in
   ```
4. Enable "Allow credentials" for each
5. Save and wait 5-10 minutes

#### Fix 2: Clear Browser Cache
```bash
# Chrome/Edge
Ctrl+Shift+Delete → Clear browsing data

# Firefox
Ctrl+Shift+Delete → Clear recent history

# Or try incognito/private mode
```

#### Fix 3: Verify Environment Variables
```bash
# Check these are set correctly:
echo $NEXT_PUBLIC_SITE_URL
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $NEXT_PUBLIC_SANITY_DATASET
```

## Section 2: Authentication Issues

### Symptoms
- ❌ Studio loads but login button doesn't work
- ❌ Authentication redirects fail
- ❌ "Authentication failed" messages
- ❌ Stuck on login screen

### Diagnosis Steps

1. **Check Authentication Cookies**
   ```
   Developer Tools → Application/Storage → Cookies
   Look for: sanity-related cookies
   ```

2. **Test Authentication Flow**
   - Try logging out completely
   - Clear all cookies
   - Attempt fresh login

3. **Check Network Requests**
   ```
   Developer Tools → Network tab
   Look for: Failed authentication requests
   Status codes: 401, 403, or CORS errors
   ```

### Solutions

#### Fix 1: Clear Authentication State
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

#### Fix 2: Check Sanity Project Permissions
1. Go to Sanity Management Console
2. Navigate to Members
3. Verify your account has proper permissions
4. Check if your email is listed as a project member

#### Fix 3: Verify API Token
```bash
# Test API token
curl -H "Authorization: Bearer YOUR_SANITY_API_TOKEN" \
  "https://3u4fa9kl.api.sanity.io/v2024-01-01/data/query/production?query=*[_type==\"post\"][0]"
```

#### Fix 4: Reset Authentication
1. Go to `/admin` on your site
2. Use the Authentication Debug Panel
3. Click "Clear Debug Cookies"
4. Try authentication again

## Section 3: Navigation Issues

### Symptoms
- ❌ Can't navigate from admin to studio
- ❌ "Open Studio" button doesn't work
- ❌ Navigation redirects to wrong URL
- ❌ Session not preserved between routes

### Diagnosis Steps

1. **Check URL Generation**
   ```javascript
   // Run in browser console on /admin
   console.log('Studio URL:', window.location.origin + '/studio');
   ```

2. **Test Direct Studio Access**
   - Try accessing `/studio` directly
   - Check if it loads without navigation

3. **Check Session Preservation**
   ```javascript
   // Check localStorage for navigation data
   console.log(localStorage.getItem('studio_navigation_session'));
   ```

### Solutions

#### Fix 1: Clear Navigation Session
```javascript
// Run in browser console
localStorage.removeItem('studio_navigation_session');
```

#### Fix 2: Use Direct Navigation
Instead of the navigation button, try:
```
https://www.aviatorstrainingcentre.in/studio
```

#### Fix 3: Check Middleware Configuration
Verify middleware is not blocking studio access:
```typescript
// Check src/middleware.ts
// Ensure /studio is in PUBLIC_ROUTES
```

## Section 4: Environment Configuration Issues

### Symptoms
- ❌ "Configuration Error" messages
- ❌ Missing environment variables warnings
- ❌ Studio loads with wrong project/dataset
- ❌ Development/production environment mismatch

### Diagnosis Steps

1. **Check Environment Variables**
   ```bash
   # Required variables
   echo "Project ID: $NEXT_PUBLIC_SANITY_PROJECT_ID"
   echo "Dataset: $NEXT_PUBLIC_SANITY_DATASET"
   echo "Site URL: $NEXT_PUBLIC_SITE_URL"
   echo "API Token: ${SANITY_API_TOKEN:0:10}..."
   ```

2. **Verify Configuration Loading**
   - Go to `/admin`
   - Check Environment Configuration Panel
   - Look for validation errors

3. **Test API Connectivity**
   ```bash
   curl "https://3u4fa9kl.api.sanity.io/v2024-01-01/data/query/production?query=*[_type==\"post\"][0]"
   ```

### Solutions

#### Fix 1: Set Missing Environment Variables
Create/update `.env.local`:
```bash
# Sanity Configuration
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in

# Authentication
JWT_SECRET=your_jwt_secret_here
```

#### Fix 2: Verify Production Configuration
For production deployment, ensure:
```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
```

#### Fix 3: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## Section 5: Deployment-Specific Issues

### Symptoms
- ❌ Works locally but fails in production
- ❌ Studio deployed but not accessible
- ❌ Environment variables not loading
- ❌ Build/deployment errors

### Diagnosis Steps

1. **Check Deployment Logs**
   ```bash
   # Vercel
   vercel logs

   # Netlify
   netlify logs

   # Check build output for errors
   ```

2. **Verify Environment Variables in Production**
   - Check hosting platform dashboard
   - Ensure all required variables are set
   - Verify no typos in variable names

3. **Test Production URLs**
   ```bash
   curl -I https://www.aviatorstrainingcentre.in/studio
   curl -I https://www.aviatorstrainingcentre.in/admin
   ```

### Solutions

#### Fix 1: Set Production Environment Variables
In your hosting platform (Vercel/Netlify):
```
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_production_token
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
JWT_SECRET=your_production_jwt_secret
```

#### Fix 2: Redeploy Studio
```bash
cd studio
npm run deploy
```

#### Fix 3: Check Build Configuration
Verify `next.config.js` and `vercel.json` are properly configured.

## Section 6: Advanced Debugging

### Enable Debug Mode

1. **Add Debug Environment Variable**
   ```bash
   DEBUG=sanity:*
   ```

2. **Use Browser Debug Tools**
   ```javascript
   // Enable verbose logging
   localStorage.setItem('debug', 'sanity:*');
   ```

3. **Check Network Activity**
   - Open Developer Tools
   - Go to Network tab
   - Filter by "sanity" or your domain
   - Look for failed requests

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized | Check API token and authentication |
| 403 | Forbidden | Verify project permissions |
| 404 | Not Found | Check URLs and routing |
| 500 | Server Error | Check server logs and configuration |
| CORS | Cross-Origin | Add domain to CORS origins |

### Health Check Endpoints

Test these endpoints:
```bash
# Studio health
curl https://www.aviatorstrainingcentre.in/api/studio/health

# Configuration validation
curl https://www.aviatorstrainingcentre.in/api/config/validate

# Authentication debug
curl https://www.aviatorstrainingcentre.in/api/auth/debug
```

## Emergency Recovery

If nothing else works:

### Nuclear Option 1: Complete Reset
```bash
# Clear all local data
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

### Nuclear Option 2: Fresh Studio Deployment
```bash
cd studio
rm -rf node_modules
npm install
npm run build
npm run deploy
```

### Nuclear Option 3: Reset CORS Configuration
1. Go to Sanity Management Console
2. Remove ALL CORS origins
3. Add only your production domain
4. Enable credentials
5. Wait 10 minutes and test

## Getting Help

### Before Contacting Support

Gather this information:
- Browser and version
- Error messages (exact text)
- Network request details
- Environment configuration
- Steps to reproduce

### Useful Debug Information

Run this in browser console and save output:
```javascript
console.log({
  url: window.location.href,
  userAgent: navigator.userAgent,
  cookies: document.cookie,
  localStorage: {...localStorage},
  sessionStorage: {...sessionStorage},
  env: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  }
});
```

### Contact Information

- **Sanity Support**: [help.sanity.io](https://help.sanity.io)
- **Community**: [Sanity Community Slack](https://slack.sanity.io)
- **Documentation**: [sanity.io/docs](https://sanity.io/docs)

---

## Prevention

### Regular Maintenance

1. **Weekly**: Test studio access
2. **Monthly**: Review CORS origins
3. **Before deployments**: Run configuration validation
4. **After domain changes**: Update all configurations

### Monitoring Setup

Set up alerts for:
- Studio accessibility
- Authentication failures
- CORS errors
- Configuration changes

This will help you catch issues before they affect users.