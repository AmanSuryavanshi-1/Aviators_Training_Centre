# Common Issues Troubleshooting

> **Solutions for frequently encountered problems**

Last Updated: December 20, 2025

---

## Quick Navigation

- [Contact Form Issues](#contact-form-issues)
- [Email Issues](#email-issues)
- [N8N Automation Issues](#n8n-automation-issues)
- [Blog & CMS Issues](#blog--cms-issues)
- [Analytics Issues](#analytics-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

---

## Contact Form Issues

### Form not submitting

**Symptoms**: User clicks submit, nothing happens

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify `/api/contact` endpoint is accessible
3. Check form validation - all required fields filled?
4. Test with incognito browser (cache issues)

```typescript
// Check if API is responding
fetch('/api/health').then(r => console.log(r.status));
```

---

### Form shows "Error occurred"

**Symptoms**: Form submits but shows error message

**Solutions**:
1. Check Vercel function logs for error details
2. Verify all environment variables are set:
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_*`
   - `N8N_CONTACT_WEBHOOK_URL`
3. Test Firebase connection
4. Test Resend API key validity

---

### Form data not saving to Firebase

**Symptoms**: Form succeeds but no data in Firebase

**Solutions**:
1. Check Firebase console for errors
2. Verify database rules allow writes
3. Check `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct
4. Test with Firebase emulator locally

---

## Email Issues

### Confirmation email not received

**Symptoms**: User submits form but no email arrives

**Solutions**:
1. Check spam/junk folder
2. Verify email address was entered correctly
3. Check Resend dashboard for delivery status
4. Verify `RESEND_API_KEY` is valid
5. Check N8N workflow executed successfully

```bash
# Test Resend API directly
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d '{"from":"test@example.com","to":"user@example.com","subject":"Test"}'
```

---

### Admin notification not received

**Symptoms**: User confirmation works, admin doesn't get email

**Solutions**:
1. Verify `OWNER1_EMAIL` and `OWNER2_EMAIL` are correct
2. Check admin email spam folders
3. Resend may be rate limiting - check dashboard
4. Verify both emails are in Resend's allowed recipients (if on free plan)

---

### Email going to spam

**Symptoms**: Emails arrive but in spam folder

**Solutions**:
1. Verify domain is authenticated in Resend (SPF, DKIM, DMARC)
2. Check "from" address matches verified domain
3. Review email content for spam triggers
4. Test with mail-tester.com

---

## N8N Automation Issues

### Webhook not triggering

**Symptoms**: Form submits but N8N doesn't run

**Solutions**:
1. Verify `N8N_CONTACT_WEBHOOK_URL` is correct
2. Check N8N instance is running
3. Verify workflow is enabled in N8N
4. Check auth token matches if using authentication

```typescript
// Test webhook manually
fetch(process.env.N8N_CONTACT_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
});
```

---

### Follow-up emails not sending

**Symptoms**: User in list but no follow-up emails

**Solutions**:
1. Check user status is "Active" in N8N list
2. Verify follow-up workflow is enabled
3. Check scheduled execution times in N8N
4. Verify user hasn't unsubscribed

---

### N8N workflow errors

**Symptoms**: Red status in N8N execution history

**Solutions**:
1. Check execution details for specific error
2. Common causes:
   - Invalid API key
   - Rate limit exceeded
   - Invalid email address format
   - Network timeout
3. Re-run failed executions after fixing

---

## Blog & CMS Issues

### Blog posts not appearing

**Symptoms**: Published post not visible on website

**Solutions**:
1. Verify `publishedAt` date is set and in the past
2. Check ISR cache - may need to wait 30 minutes
3. Manually trigger revalidation:
   ```bash
   curl -X POST 'https://www.aviatorstrainingcentre.in/api/revalidate' \
     -d '{"path":"/blog"}'
   ```
4. Check Sanity query is filtering correctly

---

### Sanity content not updating

**Symptoms**: Changes in Sanity not reflected on website

**Solutions**:
1. Wait for ISR revalidation (30 minutes for blog)
2. Manually revalidate path
3. Clear Vercel cache (Project Settings → Data Cache → Purge)
4. Verify Sanity webhook is configured for automatic revalidation

---

### Images not loading from Sanity

**Symptoms**: Broken image icons on blog posts

**Solutions**:
1. Check `remotePatterns` in `next.config.mjs` includes `cdn.sanity.io`
2. Verify image exists in Sanity media library
3. Check image URL is being generated correctly
4. Test URL directly in browser

---

## Analytics Issues

### Analytics not tracking

**Symptoms**: Dashboard shows no data

**Solutions**:
1. Check if user has ad blocker (blocks tracking)
2. Verify `UTMTracker` component is in layout
3. Check browser console for analytics errors
4. Verify Firebase Firestore connection
5. Check if events are being batched (wait for flush)

---

### Bot traffic too high

**Symptoms**: Analytics shows unrealistic numbers

**Solutions**:
1. Bot detection might not be working - check `botDetection.ts`
2. Add additional bot patterns to detection
3. Filter out known bot user agents in dashboard
4. Enable Vercel Bot Protection if available

---

### Dashboard loading slow

**Symptoms**: Analytics dashboard takes forever to load

**Solutions**:
1. Reduce date range (smaller query)
2. Add Firestore indexes for compound queries
3. Implement pagination for large datasets
4. Enable caching for dashboard API

---

## Authentication Issues

### "Unauthorized" on admin pages

**Symptoms**: Redirected to login even when logged in

**Solutions**:
1. Check `admin-session` cookie exists
2. Verify `ADMIN_JWT_SECRET` is set and hasn't changed
3. Token may be expired - login again
4. Check middleware is running on correct paths

---

### Login not working

**Symptoms**: Correct credentials but can't login

**Solutions**:
1. Check console for error messages
2. Verify Sanity member exists with correct role
3. Check `ADMIN_JWT_SECRET` is configured
4. Test API route directly:
   ```bash
   curl -X POST 'https://www.aviatorstrainingcentre.in/api/auth/login' \
     -d '{"email":"admin@example.com","password":"xxx"}'
   ```

---

### Session expires too quickly

**Symptoms**: Logged out frequently

**Solutions**:
1. Check token expiry time (default 7 days)
2. Verify cookie `maxAge` matches token expiry
3. Check if browser is clearing cookies
4. Implement refresh token mechanism

---

## Performance Issues

### Slow page load

**Symptoms**: LCP > 2.5 seconds

**Solutions**:
1. Add `priority` to hero images
2. Check for large unoptimized images
3. Enable code splitting for heavy components
4. Review bundle size with analyzer
5. Check for blocking third-party scripts

---

### Layout shift (CLS)

**Symptoms**: Content jumping around on load

**Solutions**:
1. Always specify `width` and `height` on images
2. Reserve space for dynamic content
3. Use font display swap
4. Check for late-loading ads/embeds

---

### Large JavaScript bundle

**Symptoms**: Slow initial load, high TTI

**Solutions**:
1. Run bundle analyzer: `ANALYZE=true npm run build`
2. Dynamic import heavy components
3. Remove unused dependencies
4. Check for duplicate packages

---

## Deployment Issues

### Build failing

**Symptoms**: Vercel build errors

**Solutions**:
1. Check TypeScript errors: `npm run build`
2. Verify all environment variables are set in Vercel
3. Check for missing dependencies
4. Review build logs for specific error

---

### Environment variables not working

**Symptoms**: Features broken in production

**Solutions**:
1. Verify variables are set for Production scope
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding new variables
4. For client-side vars, must start with `NEXT_PUBLIC_`

---

### 500 errors in production

**Symptoms**: Works locally, fails in production

**Solutions**:
1. Check Vercel Function logs
2. Verify all env vars are set
3. Check function timeout (default 10s, max 30s)
4. Review error in Vercel dashboard

---

## Quick Fixes Cheat Sheet

| Problem | Quick Fix |
|---------|-----------|
| Cache issues | Vercel → Settings → Data Cache → Purge |
| Content not updating | `POST /api/revalidate` with path |
| Form not working | Check browser console + Vercel logs |
| Emails not sending | Check Resend dashboard |
| N8N not running | Check N8N dashboard execution history |
| Analytics missing | Check for ad blockers |
| Auth failing | Clear cookies, login again |

---

## Getting Help

If these solutions don't work:

1. **Check logs**: Vercel Function Logs, Browser Console
2. **Check dashboards**: Resend, Firebase, N8N
3. **Test locally**: `npm run dev` and reproduce issue
4. **Review recent changes**: What changed before the issue?

---

## Related Documentation

- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)
- [API Integration](../API_INTEGRATION.md)
- [N8N Overview](../n8n/OVERVIEW.md)
