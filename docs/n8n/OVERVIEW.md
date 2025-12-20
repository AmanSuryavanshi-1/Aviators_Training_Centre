# N8N Automation System Overview

> **What N8N does and how it integrates with the website**

Last Updated: December 20, 2025

---

## What is N8N? (For Non-Technical People)

N8N is a tool that automates tasks when certain things happen on our website. Think of it like an auto-responder on steroids.

For example, when someone submits a contact form, N8N automatically:
- Sends them an email confirmation
- Notifies the owner about the new lead
- Saves their information in a database
- Adds them to a follow-up email sequence

All of this happens in about 5 seconds, without any manual work.

---

## Why We Use N8N

### Key Benefits

| Benefit | What This Means |
|---------|-----------------|
| **Automatic emails** | Users get instant confirmation emails |
| **Follow-up sequences** | 3 emails sent over 24 days automatically |
| **No manual work** | Staff don't need to process each inquiry |
| **Scales automatically** | Works the same for 1 or 1000 submissions |
| **Runs independently** | Doesn't slow down the website |

---

## System Architecture (High-Level)

```
User fills contact form on website
              │
              ▼
     Click "Submit" button
              │
              ▼
   Website validates form data
              │
              ▼
    Send to Contact API endpoint
              │
              ▼
  ┌───────────────────────────────┐
  │     Website Backend           │
  │  • Validates data again       │
  │  • Saves to Firebase          │
  │  • Triggers N8N webhook       │
  └───────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────┐
  │     N8N Workflow              │
  │  ├─ Send confirmation email   │
  │  ├─ Send admin notification   │
  │  ├─ Store in database         │
  │  └─ Add to follow-up list     │
  └───────────────────────────────┘
              │
              ▼
    Response back to website
              │
              ▼
    Show "Thank you" message
```

**What happens**: User submits form → Website processes it → N8N handles all emails and follow-ups automatically.

**Result**: User gets email, admin gets notified, data is saved, and user enters follow-up sequence.

---

## Key Workflows (High-Level List)

### 1. Contact Form → Email + Database

| What | User submits form, gets email confirmation |
|------|-------------------------------------------|
| When | Immediately after submission |
| Time | Less than 5 seconds |
| Status | ✅ Running automatically 24/7 |

---

### 2. Follow-up Email Sequence

| What | User gets 3 follow-up emails over 24 days |
|------|-------------------------------------------|
| When | Day 3, Day 10, Day 24 after submission |
| Time | 24 days total |
| Status | ✅ Running automatically |

---

### 3. Cancellation Processing

| What | User clicks "unsubscribe", stops getting emails |
|------|------------------------------------------------|
| When | Immediately after clicking the link |
| Time | Less than 1 second |
| Status | ✅ Running automatically |

---

## Integration Points

| Integration | File | Purpose |
|-------------|------|---------|
| **Contact API** | `src/app/api/contact/route.ts` | Triggers N8N when form is submitted |
| **N8N Webhook** | N8N receives data from Contact API | Starts automation workflow |
| **Response** | N8N confirms success/failure | Website shows appropriate message |

---

## When to Use Which Documentation

| Question | Read This |
|----------|-----------|
| "What is N8N?" | This file (OVERVIEW.md) |
| "Where does my form data go?" | [CONTACT_FORM_DATA_FLOW.md](CONTACT_FORM_DATA_FLOW.md) |
| "What workflows are running?" | [WORKFLOWS_SUMMARY.md](WORKFLOWS_SUMMARY.md) |
| "How do I modify a workflow?" | Existing detailed N8N docs (see below) |
| "Why isn't email sending?" | [TROUBLESHOOTING](../troubleshooting/COMMON_ISSUES.md#n8n) |

---

## Quick Troubleshooting

### "User says they didn't get confirmation email"

1. Check if form submission was successful (user saw "thank you" message?)
2. Ask user to check spam/junk folder
3. Check N8N dashboard for workflow execution
4. If N8N shows error, check Resend API key

### "Follow-up emails not being sent"

1. Check if user is in the follow-up list (N8N dashboard)
2. Verify user hasn't unsubscribed
3. Check workflow is enabled in N8N

### "Too many emails being sent"

1. User may have submitted form multiple times
2. Check for duplicate entries in Firebase
3. N8N has deduplication - may need manual cleanup

---

## Next Steps

1. **Understand the flow**: Read [CONTACT_FORM_DATA_FLOW.md](CONTACT_FORM_DATA_FLOW.md)
2. **See all workflows**: Read [WORKFLOWS_SUMMARY.md](WORKFLOWS_SUMMARY.md)
3. **Debug issues**: See [TROUBLESHOOTING](../troubleshooting/COMMON_ISSUES.md)
4. **Modify workflows**: See detailed docs below

---

## Reference: Existing Detailed N8N Documentation

For detailed workflow configuration and modifications, see the existing technical documentation:

| Document | Purpose |
|----------|---------|
| `aviators-training-centre-technical-documentation.md` | Full technical details including N8N implementation |

These contain node-level configuration and are intended for developers making workflow changes.
