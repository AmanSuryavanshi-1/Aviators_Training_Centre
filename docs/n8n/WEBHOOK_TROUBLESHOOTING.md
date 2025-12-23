# n8n Webhook Integration Guide & Troubleshooting

> **Last Updated:** December 23, 2024  
> **Status:** ✅ Working in Production

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why We Chose This Approach](#why-we-chose-this-approach)
3. [How the Webhook Works](#how-the-webhook-works)
4. [Test vs Production URLs](#test-vs-production-urls)
5. [Authentication Setup](#authentication-setup)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Key Learnings](#key-learnings)

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Contact Form  │────▶│  /api/contact   │────▶│  Firebase DB    │     │                 │
│   (Frontend)    │     │  (Next.js API)  │────▶│  (Storage)      │     │   n8n Workflow  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘     │   (Automation)  │
                                 │                                       │                 │
                                 │         ┌─────────────────────────────▶                 │
                                 └─────────┤  HTTP POST with Auth        └─────────────────┘
                                           │  (Webhook Trigger)
```

**Flow:**
1. User submits contact form
2. Next.js API saves data to Firebase Realtime Database
3. **Same API call** triggers n8n webhook with form data
4. n8n runs automation (emails, CRM updates, notifications, etc.)

---

## Why We Chose This Approach

### ❌ Alternative: Firebase Cloud Functions Trigger
Firebase offers Cloud Functions to trigger webhooks when database changes occur. However:

| Factor | Firebase Functions | Our Approach (API Webhook) |
|--------|-------------------|---------------------------|
| **Cost** | Requires **Blaze Plan** (pay-as-you-go) | **Free** (included in Vercel) |
| **Complexity** | Need to deploy/maintain Cloud Functions | Simple HTTP call in existing API |
| **Latency** | Additional hop (DB → Function → Webhook) | Direct call from API |
| **Control** | Limited control over payload format | Full control over what data is sent |

### ✅ Our Solution: API-Level Webhook Invocation
We trigger the webhook directly from the `/api/contact` route **after** saving to Firebase. This:
- **Saves money** - No Firebase Blaze plan needed
- **Reduces latency** - One less network hop
- **Gives full control** - We decide exactly what data to send

---

## How the Webhook Works

### Code Location
```
src/lib/n8n/contact-webhook.ts
```

### Key Function: `triggerContactFormWebhook()`
```typescript
// Called after Firebase save succeeds
await triggerContactFormWebhook(formData, newContactRef.key);
```

### Payload Structure (what n8n receives)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "Course Inquiry",
  "message": "I want to know about CPL courses",
  "formId": "firebase-generated-key",
  "isDemoBooking": false,
  "timestamp": "2024-12-23T13:00:00Z"
}
```

In n8n, access these fields using: `{{ $json.name }}`, `{{ $json.email }}`, etc.

---

## Test vs Production URLs

> ⚠️ **This is the #1 source of confusion!**

| URL Type | When It Works | How to Use |
|----------|---------------|------------|
| `/webhook-test/firebase-webhook` | Only during **"Listen for test event"** mode | Click button in n8n, then send request |
| `/webhook/firebase-webhook` | Only when workflow is **Active** (green toggle) | Just activate workflow, no clicking needed |

### Common Mistake
❌ Clicking "Execute Workflow" or "Listen for test event" for production webhooks

### Correct Approach
✅ For production: Just **activate the workflow** (green toggle) and leave it alone. Requests to production URL will auto-trigger the workflow.

---

## Authentication Setup

### n8n Side (Webhook Node)

1. Open Webhook node → Set **Authentication** to "Header Auth"
2. Click pencil icon next to credential
3. Set:
   - **Name:** `Authorization`
   - **Value:** `Bearer your-secret-token-here`
4. Save credential

### Vercel Side (Environment Variables)

Add this environment variable:
```
N8N_WEBHOOK_AUTH_TOKEN=your-secret-token-here
```

> **Note:** Don't include "Bearer " in the Vercel env var - the code adds it automatically.

### How It Works in Code
```typescript
// contact-webhook.ts
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${process.env.N8N_WEBHOOK_AUTH_TOKEN}`
});
```

---

## Troubleshooting Guide

### Problem 1: Webhook Not Triggering

**Symptoms:** Form submits successfully, Firebase updates, emails send, but n8n doesn't run.

**Check:**
1. Is the workflow **Active**? (green toggle in n8n)
2. Are you using the **production URL** (`/webhook/...` not `/webhook-test/...`)?
3. Check Vercel function logs for errors

### Problem 2: 403 Forbidden Error

**Symptoms:** `Invoke-RestMethod : The remote server returned an error: (403) Forbidden`

**Cause:** Authentication mismatch between n8n and your application.

**Fix:**
1. Check n8n Webhook node → Authentication settings
2. Make sure the token in n8n matches `N8N_WEBHOOK_AUTH_TOKEN` in Vercel
3. Redeploy after changing Vercel env vars

### Problem 3: Workflow Shows "Listening" But Never Triggers

**Symptoms:** You clicked "Listen for test event" but nothing happens.

**Cause:** You're sending requests to the production URL while in test mode.

**Fix:**
- For testing: Use `/webhook-test/...` URL while "Listen for test event" is active
- For production: Use `/webhook/...` URL with workflow activated (don't click listen)

### Problem 4: No Console Logs in Production

**Symptoms:** Can't see what's happening with webhook calls.

**Check:** Vercel Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **Functions** → `/api/contact`
4. View **Runtime Logs**

### Problem 5: Self-Hosted n8n Not Receiving Webhooks

**If using Docker + Cloudflare Tunnel:**
- Ensure Docker container is running: `docker ps`
- Ensure Cloudflare Tunnel is active
- Check n8n logs: `docker logs <container-name>`

---

## Key Learnings

### 1. Test vs Production URLs Are Different Endpoints
The `-test` in the URL isn't just a label - it's a completely different endpoint that only works in test mode.

### 2. "Workflow was started" = Success
When you see this response, the webhook worked! Check n8n's **Executions** tab to see results.

### 3. Production Webhooks Are Passive
You don't need to click anything. Just activate the workflow and it listens automatically.

### 4. Always Match Auth Tokens
If n8n has `Bearer xyz`, your app must send `Bearer xyz`. One character difference = 403 error.

### 5. Check Executions Tab for Debug
n8n's Executions tab (left sidebar) shows all workflow runs - success, failure, and errors.

### 6. Vercel Env Vars Need Redeploy
After changing env vars in Vercel, you **must redeploy** for changes to take effect.

---

## Quick Reference Commands

### Test Production Webhook (PowerShell)
```powershell
Invoke-RestMethod -Uri "https://n8n.aviatorstrainingcentre.in/webhook/firebase-webhook" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"} `
  -Body '{"name":"Test","email":"test@test.com","message":"Test message","subject":"Test","formId":"test123","isDemoBooking":false,"timestamp":"2024-12-23T12:00:00Z"}'
```

### Check Docker n8n Status
```bash
docker ps | grep n8n
docker logs n8n-container-name
```

---

## Environment Variables Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `N8N_WEBHOOK_AUTH_TOKEN` | Vercel | Auth token for webhook calls |
| `N8N_WEBHOOK_URL_PROD` | Vercel (optional) | Override production URL |
| `N8N_WEBHOOK_URL_TEST` | Vercel (optional) | Override test URL |

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/lib/n8n/contact-webhook.ts` | Webhook trigger logic |
| `src/app/api/contact/route.ts` | API route that calls the webhook |
| `.env.local` | Local environment variables |

---

> 💡 **Pro Tip:** Bookmark the n8n Executions page. Whenever something seems wrong, check there first - it shows exactly what happened with each workflow run.
