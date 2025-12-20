# Active N8N Workflows - Quick Reference

> **All workflows at a glance with status and timing**

Last Updated: December 20, 2025

---

## Workflow 1: Contact Form → Email + Storage

### Purpose
Handle form submissions automatically

### Triggered By
User submits form on website

### What Happens (Simple)

```
N8N receives form data via webhook
         │
         ├──▶ Sends confirmation email to user
         │
         ├──▶ Sends notification email to admin
         │
         ├──▶ Saves data in database
         │
         └──▶ Adds user to follow-up list
```

### Details

| Field | Value |
|-------|-------|
| **Trigger** | Contact API webhook |
| **Files Involved** | `src/app/api/contact/route.ts` |
| **Time to Complete** | Less than 1 second (all steps run in parallel) |
| **Status** | ✅ Running 24/7 |
| **Frequency** | Every time someone submits the form |

### For More Details
See [CONTACT_FORM_DATA_FLOW.md](CONTACT_FORM_DATA_FLOW.md)

---

## Workflow 2: Follow-up Email Sequence

### Purpose
Send multiple emails to new contacts over time

### Triggered By
User added to follow-up list (from Workflow 1)

### What Happens (Timeline)

```
Day 0: User submits form
         │
         ▼  (Wait 3 days)
Day 3: Email #1 → "Interested in learning more?"
         │
         ▼  (Wait 7 days)
Day 10: Email #2 → "Last chance to join next batch"
         │
         ▼  (Wait 14 days)
Day 24: Email #3 → "Your invitation expires today"
         │
         ▼
User either: Books demo OR Clicks unsubscribe
```

### Email Contents

| Email | Day | Subject | Purpose |
|-------|-----|---------|---------|
| #1 | 3 | Course overview | Remind about inquiry |
| #2 | 10 | Upcoming batch | Create urgency |
| #3 | 24 | Final invitation | Last chance offer |

### Details

| Field | Value |
|-------|-------|
| **Template** | Managed in N8N |
| **List tracking** | N8N database |
| **Total duration** | 24 days (if user completes full sequence) |
| **Status** | ✅ Running automatically |

### User Can Stop Emails
- Click "Unsubscribe" link in any email
- Automatically removed from future emails
- See Workflow 3 below

---

## Workflow 3: Cancellation Request Processing

### Purpose
Remove users who don't want emails

### Triggered By
User clicks "unsubscribe" link in email

### What Happens (Simple)

```
N8N receives cancellation request
         │
         ├──▶ Removes user from active follow-up list
         │
         ├──▶ Marks user as "cancelled" in database
         │
         └──▶ Sends confirmation: "You've been unsubscribed"
```

### Details

| Field | Value |
|-------|-------|
| **Time to Complete** | Less than 1 second |
| **Status** | ✅ Running automatically |
| **Result** | No more emails sent to this user |

### User Can Re-subscribe
- If user fills form again: Added back to list
- Treated as new user (starts from Day 0)
- Previous emails not sent again

---

## How Workflows Work Together

### User Journey Map

```
User submits contact form
         │
         ▼
┌─────────────────────────────────┐
│      WORKFLOW 1                 │
│  • Confirmation email ✓         │
│  • Admin notification ✓         │
│  • Save to database ✓           │
│  • Add to follow-up list ✓      │
└─────────────────────────────────┘
         │
         ▼ (Wait 3 days)
┌─────────────────────────────────┐
│      WORKFLOW 2                 │
│  Email #1 sent                  │
│                                 │
│  User can:                      │
│   ├── Book demo (goal!)        │
│   ├── Do nothing (wait more)   │
│   └── Unsubscribe →→→→→→→→→→→→┐│
└─────────────────────────────────┘│
         │                         │
         ▼ (Wait 7 days)          │
┌─────────────────────────────────┐│
│  Email #2 sent                  ││
│  Same options...                ││
└─────────────────────────────────┘│
         │                         │
         ▼ (Wait 14 days)         │
┌─────────────────────────────────┐│
│  Email #3 sent (final)          ││
│  Same options...                ││
└─────────────────────────────────┘│
                                   │
         ┌─────────────────────────┘
         ▼
┌─────────────────────────────────┐
│      WORKFLOW 3                 │
│  Remove from list ✓             │
│  Mark as cancelled ✓            │
│  Confirmation email ✓           │
└─────────────────────────────────┘
         │
         ▼
   (End of user journey)
```

---

## Workflow Monitoring

### How to Check if Workflows are Running

1. **Open** N8N dashboard
2. **Look at** "Executions" tab
3. **Should see** recent workflow runs (within last hour typically)
4. **Green** = Success
5. **Red** = Failed

### If Workflow Not Running

| Check | Solution |
|-------|----------|
| Is N8N instance running? | Dashboard should be accessible |
| Is webhook URL correct? | Compare with API integration code |
| Did someone disable the workflow? | Check N8N settings |
| Is there an error? | See execution history for details |

---

## Common Issues

### "Emails not being sent"

```
Check: Did Workflow 1 run? (N8N dashboard)
   │
   └── Check: Is Resend API key valid? (Vercel env vars)
         │
         └── Check: Is email template correct? (N8N editor)
```

### "User not in follow-up list"

```
Check: Did Workflow 1 run? (N8N dashboard)
   │
   └── Check: Did "List add" node execute? (Workflow history)
         │
         └── Check: Was user already in list? (No duplicate adds)
```

### "Cancellation not working"

```
Check: Did Workflow 3 trigger? (N8N dashboard)
   │
   └── Check: Is unsubscribe link correct? (Email body)
         │
         └── Check: Did user actually click link? (N8N logs)
```

---

## Quick Reference Table

| Workflow | Trigger | Purpose | Time | Status |
|----------|---------|---------|------|--------|
| 1 | Form submit | Send emails + save data | <1s | ✅ Active |
| 2 | User added to list | Follow-up sequence | 24 days | ✅ Active |
| 3 | Unsubscribe click | Remove from emails | <1s | ✅ Active |

---

## When to Read Existing N8N Documentation

These 3 overview docs are for **high-level understanding**.

For **detailed workflow configuration**:
- See existing N8N documentation in the technical docs
- These contain node-by-node setup
- Only needed if modifying workflows

---

## Next Steps

| Need To | Action |
|---------|--------|
| Understand the flow | Read [CONTACT_FORM_DATA_FLOW.md](CONTACT_FORM_DATA_FLOW.md) |
| Debug an issue | See [TROUBLESHOOTING](../troubleshooting/COMMON_ISSUES.md) |
| Modify a workflow | See existing detailed N8N docs |
| Check status | Go to N8N dashboard and see executions |

---

## Related Documentation

- [N8N Overview](OVERVIEW.md)
- [Contact Form Data Flow](CONTACT_FORM_DATA_FLOW.md)
- [Troubleshooting](../troubleshooting/COMMON_ISSUES.md)
