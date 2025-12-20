# Contact Form to N8N Data Flow

> **Step-by-step explanation of where form data goes**

Last Updated: December 20, 2025

---

## The Flow (Simple Visual)

```
User fills form on website
         │
         ▼
Click "Submit"
         │
         ▼
Frontend validates form (email, phone, message)
         │
         ▼
Send to: POST /api/contact
         │
         ▼
Backend validates again + stores in Firebase
         │
         ▼
Triggers N8N webhook
         │
         ▼
N8N Workflow receives data
         │
         ├──▶ Email Service: Sends confirmation to user
         │
         ├──▶ Email Service: Sends notification to admin
         │
         ├──▶ Database: Saves contact info
         │
         └──▶ List: Adds user to follow-up sequence
         │
         ▼
Response back to frontend
         │
         ▼
Show "Thank you" message
```

**Total time**: ~5 seconds from user click to completion

---

## What Each Step Does

### Step 1: User Submits Form

| Field | Description |
|-------|-------------|
| **Where** | `src/components/features/contact/ContactFormCard.tsx` |
| **Validates** | Email format (must include @), phone format (10 digits), message length (min 10 chars) |
| **Sends** | Form data to backend API |
| **Why validate here** | Catch errors before sending to server |

---

### Step 2: Backend Validates Again

| Field | Description |
|-------|-------------|
| **Where** | `src/app/api/contact/route.ts` |
| **Re-validates** | Everything (security - don't trust frontend) |
| **Stores** | Data in Firebase collection named 'contacts' |
| **Triggers** | N8N webhook (almost instant) |
| **Why validate again** | Security best practice |

---

### Step 3: N8N Receives Data

| Field | Description |
|-------|-------------|
| **Webhook URL** | Configured in environment variables |
| **Data received** | `{ name, email, phone, message, timestamp }` |
| **Processing** | Parallel execution (all steps at same time) |
| **Status** | Returns success/failure to API |

---

### Step 4: Email Confirmation Sent to User

| Field | Description |
|-------|-------------|
| **Service** | Resend (email provider) |
| **Template** | HTML email with form confirmation |
| **Recipient** | User's email address |
| **Timing** | Within 5 seconds of submission |
| **Contains** | Thank you message, course info link |

---

### Step 5: Admin Notification Sent

| Field | Description |
|-------|-------------|
| **Service** | Resend (same email provider) |
| **Template** | HTML email with all form details |
| **Recipients** | Owner email addresses |
| **Timing** | Within 5 seconds of submission |
| **Contains** | All user info, message, traffic source |

---

### Step 6: User Added to Follow-up List

| Field | Description |
|-------|-------------|
| **Database** | N8N internal database |
| **List name** | "Contact Form Submissions" |
| **Status** | "Active - Pending Follow-up" |
| **Trigger** | Starts follow-up workflow automatically |
| **Timing** | First email sends 3 days later |

---

## Files Involved

### Frontend

| File | Purpose |
|------|---------|
| `src/components/features/contact/ContactFormCard.tsx` | Form UI and submission |
| `src/hooks/use-form-validation.ts` | Validation logic |

### Backend

| File | Purpose |
|------|---------|
| `src/app/api/contact/route.ts` | API endpoint |
| `src/lib/firebase/collections.ts` | Firebase storage |
| `src/lib/validation.ts` | Validation rules |

### N8N

| Component | Purpose |
|-----------|---------|
| Contact Form Webhook | Trigger |
| Email nodes | Send confirmation + admin notification |
| Database node | Store data |
| List node | Add to follow-up sequence |

---

## Key Points for Developers

### If you need to add a new field to contact form:

1. **Update ContactFormCard.tsx** - Add input field
2. **Update validation.ts** - Add validation rule
3. **Update API route.ts** - Add to data sent to N8N
4. **N8N automatically receives** - New field appears in workflow

---

### If you need to change confirmation email template:

1. **Update** `src/app/api/contact/route.ts` (template HTML section)
2. **Test** by submitting a test form
3. **Check** confirmation email arrives with new content

---

### If you need to change admin notification email:

1. **See** existing N8N documentation
2. **Modify** in N8N dashboard (Email node)
3. **Test** by submitting a test form

---

### If you need to check if emails are being sent:

1. **Go to** N8N dashboard
2. **Look at** workflow execution history
3. **Check if** "Email sent" node shows green (success)
4. **If red** - Check Resend API key in Vercel environment variables

---

### If you need to check if user was added to follow-up list:

1. **Go to** N8N dashboard
2. **Check** "Contact Form Submissions" list
3. **Search** for user's email
4. **Should show** "Active" status

---

## Troubleshooting Quick Guide

### "User says they didn't get confirmation email"

```
Step 1: Check N8N dashboard (did workflow run?)
    │
    ├── If NO: Check webhook URL in environment
    │
    └── If YES: Continue to Step 2

Step 2: Check Resend console (was email attempted?)
    │
    ├── If NO: Check email template in N8N
    │
    └── If YES: Continue to Step 3

Step 3: Check user's spam folder
    │
    └── If not there: Verify email address was correct
```

---

### "Form submission takes more than 10 seconds"

```
Step 1: Check N8N dashboard (is it running slow?)
    │
    └── If YES: Check N8N server resources

Step 2: Check Firebase connection (is it timing out?)
    │
    └── If YES: Check Firebase quota/billing

Step 3: Check Resend API (is it responding?)
    │
    └── If NO: Check Resend status page
```

---

### "User data in Firebase but email not sent"

```
Firebase worked (API succeeded)
    │
    ▼
Check N8N (did webhook trigger?)
    │
    ├── If NO: Webhook URL might be wrong
    │
    └── If YES: Check Resend API key in N8N
```

---

### "Duplicate submissions from same user"

```
Step 1: Check if user clicked submit twice
    │
    ├── If YES: Frontend should disable button (check this)
    │
    └── If NO: Continue to Step 2

Step 2: Check N8N for duplicate handling
    │
    └── May need to add deduplication node

Step 3: Check frontend form submission handling
    │
    └── Button should disable on click
```

---

## Data Schema

### What gets stored in Firebase

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "subject": "CPL Training Inquiry",
  "message": "I want to learn more about pilot training",
  "utm_source": "google",
  "utm_medium": "organic",
  "utm_campaign": null,
  "timestamp": "2024-12-20T10:00:00.000Z",
  "referrer": "https://google.com"
}
```

### What gets sent to N8N

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "subject": "CPL Training Inquiry",
  "message": "I want to learn more about pilot training",
  "contactId": "-NxYz123abc",
  "timestamp": "2024-12-20T10:00:00.000Z",
  "isDemoBooking": false
}
```

---

## Related Documentation

- [N8N Overview](OVERVIEW.md)
- [Workflows Summary](WORKFLOWS_SUMMARY.md)
- [Troubleshooting](../troubleshooting/COMMON_ISSUES.md)
