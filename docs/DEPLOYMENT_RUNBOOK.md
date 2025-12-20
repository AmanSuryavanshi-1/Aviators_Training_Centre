# Deployment Runbook

> **Step-by-step deployment process and configuration**

Last Updated: December 20, 2025

---

## Deployment Overview

| Environment | Platform | URL |
|-------------|----------|-----|
| **Production** | Vercel | https://www.aviatorstrainingcentre.in |
| **Preview** | Vercel | PR-based preview URLs |
| **Sanity Studio** | Vercel | https://www.aviatorstrainingcentre.in/studio |

---

## Quick Deployment

### Deploy to Production

```bash
# Push to main branch triggers automatic deployment
git push origin main
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

### 2. Environment Variables
- [ ] All required env vars set in Vercel
- [ ] Secrets not committed to git

### 3. Testing
- [ ] Contact form works
- [ ] Blog posts load correctly
- [ ] Admin dashboard accessible
- [ ] N8N webhooks responding

---

## Environment Variables

### Required Variables

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
FIREBASE_SERVICE_ACCOUNT_KEY=xxx (base64 encoded)

# Email (Resend)
RESEND_API_KEY=re_xxxx
FROM_EMAIL=noreply@aviatorstrainingcentre.in
OWNER1_EMAIL=xxx
OWNER2_EMAIL=xxx

# N8N Automation
N8N_CONTACT_WEBHOOK_URL=https://xxx
N8N_WEBHOOK_AUTH_TOKEN=xxx

# Admin Authentication
ADMIN_JWT_SECRET=xxx (32+ character random string)

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
NODE_ENV=production
```

### Setting in Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)
3. Use "Sensitive" flag for secrets

---

## Vercel Configuration

### vercel.json

```json
{
  "version": 2,
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"],
  
  "rewrites": [
    { "source": "/studio/:path*", "destination": "/studio/:path*" },
    { "source": "/admin/:path*", "destination": "/admin/:path*" }
  ],
  
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ],
  
  "functions": {
    "src/app/api/**/route.{js,ts}": {
      "maxDuration": 30
    }
  },
  
  "crons": [
    { "path": "/api/maintenance", "schedule": "0 2 * * *" }
  ],
  
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "aviatorstrainingcentre.in" }],
      "destination": "https://www.aviatorstrainingcentre.in/:path*",
      "permanent": true
    }
  ]
}
```

---

## Build Process

### Local Build

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Test production build locally
npm run start
```

### Build Scripts

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postbuild": "next-sitemap"
  }
}
```

### Build Output

```
Route (app)                              Size
┌ ○ /                                   15 kB
├ ○ /about                               8 kB
├ ○ /blog                               12 kB
├ ● /blog/[slug]                        10 kB
├ ○ /contact                             9 kB
├ ○ /courses                            11 kB
├ ○ /api/contact                         0 B  (serverless)
└ ...more

○ Static   - Prerendered at build
● SSG      - Prerendered on-demand
λ Dynamic  - Rendered at runtime
```

---

## Domain Configuration

### DNS Settings

| Record | Name | Value |
|--------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### SSL Certificate
- Automatically provisioned by Vercel
- Auto-renews before expiration

### Redirects
- Non-www → www (301 redirect)
- HTTP → HTTPS (automatic)

---

## Monitoring & Health Checks

### Uptime Monitoring

```bash
# Health check endpoint
GET /api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-12-20T10:00:00.000Z",
  "services": {
    "sanity": "connected",
    "firebase": "connected"
  }
}
```

### Vercel Analytics

1. Enable in Vercel Dashboard → Analytics
2. View real-time and historical data
3. Monitor Core Web Vitals

### Error Monitoring

1. Check Vercel → Functions → Logs
2. Monitor for 500 errors
3. Set up Slack/Discord alerts

---

## Rollback Procedures

### Quick Rollback

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

### Git Rollback

```bash
# Revert to specific commit
git revert HEAD
git push origin main

# Or reset to specific commit (destructive)
git reset --hard <commit-hash>
git push --force origin main
```

---

## Cache Invalidation

### Clear Vercel Cache

1. Go to Vercel Dashboard → Project → Settings
2. Under "Data Cache", click "Purge Everything"

### Revalidate Specific Paths

```bash
# API endpoint
POST /api/revalidate
Content-Type: application/json

{
  "path": "/blog",
  "secret": "<revalidation-secret>"
}
```

### Sanity Webhook

Configure webhook in Sanity to trigger revalidation:
1. Go to Sanity → Settings → API → Webhooks
2. Add webhook URL: `https://www.aviatorstrainingcentre.in/api/revalidate`
3. Filter: `_type in ["post", "category"]`

---

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| `Module not found` | Check import paths, run `npm install` |
| `Type error` | Fix TypeScript errors locally first |
| `Out of memory` | Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096` |

### Runtime Errors

| Error | Solution |
|-------|----------|
| `500 Internal Error` | Check Vercel function logs |
| `404 Not Found` | Verify routes and rewrites |
| `CORS Error` | Check API CORS headers |

### Common Issues

1. **Environment variables not working**
   - Verify variable names match exactly
   - Redeploy after adding new variables

2. **Sanity content not updating**
   - Check ISR revalidation time
   - Trigger manual revalidation
   - Verify webhook configuration

3. **N8N webhooks failing**
   - Check webhook URL is correct
   - Verify auth token matches
   - Check N8N instance is running

---

## Scheduled Tasks

### Daily Maintenance (2 AM UTC)

```json
{
  "path": "/api/maintenance",
  "schedule": "0 2 * * *"
}
```

Tasks:
- Clean up old analytics data
- Generate daily reports
- Health check external services

---

## Security Checklist

- [ ] JWT secret is strong (32+ characters)
- [ ] API keys are rotated quarterly
- [ ] Security headers are set
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] No secrets in git history

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [API Integration](API_INTEGRATION.md)
- [Performance Tuning](PERFORMANCE_TUNING.md)
