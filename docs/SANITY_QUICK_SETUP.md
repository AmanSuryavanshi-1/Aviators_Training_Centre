# Sanity CMS Quick Setup Reference

## 🚀 Quick Start (5 minutes)

### 1. Copy Environment File
```bash
cp .env.local.example .env.local
```

### 2. Get Your API Token
1. Go to https://sanity.io/manage
2. Select "Aviators Training Centre" project
3. Click API → Tokens → "Add API token"
4. Name: "Blog Admin Token"
5. **Permissions: Editor** (CRITICAL!)
6. Copy the token (starts with `sk`)

### 3. Update .env.local
```bash
# Replace these values in .env.local:
***REMOVED***
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
***REMOVED***k_your_token_here
```

### 4. Test Your Setup
```bash
npm run validate:sanity
```

### 5. Start Development
```bash
npm run dev
```

## ✅ Success Checklist

- [ ] Environment file created (`.env.local`)
- [ ] API token has Editor permissions
- [ ] Validation script passes all checks
- [ ] Admin dashboard shows blog posts (`/admin`)
- [ ] Blog page displays content (`/blog`)
- [ ] Can create/edit/delete posts in admin

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Insufficient permissions" | Create new token with **Editor** permissions |
| "Unauthorized" | Check token format (starts with `sk`) |
| Admin shows zero blogs | Run `npm run validate:sanity` to diagnose |
| Changes don't appear | Clear cache: `rm -rf .next/cache && npm run dev` |

## 📚 Full Documentation

- [Complete Setup Guide](guides/SANITY_ENVIRONMENT_SETUP.md)
- [Troubleshooting Guide](guides/SANITY_SYNC_TROUBLESHOOTING.md)
- [Deployment Checklist](guides/SANITY_DEPLOYMENT_CHECKLIST.md)

## 🆘 Need Help?

Run the diagnostic script:
```bash
npm run validate:sanity
```

This will tell you exactly what's wrong and how to fix it.