# Email Service

> **Transactional email via Resend API**

Last Updated: December 20, 2025

---

## Overview

The email service handles:
- Contact form confirmation emails
- Owner notification emails
- HTML email templates
- Rate limit handling

---

## Current Implementation

### Architecture

```
Email Service
├── Resend API Integration
│   ├── API client setup
│   ├── Email sending
│   └── Error handling
│
├── Email Templates
│   ├── User confirmation
│   └── Owner notification
│
└── N8N Integration
    ├── Webhook trigger
    └── Follow-up sequences
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/contact/route.ts` | Email sending logic |
| Email templates (embedded) | HTML templates |

---

## Core Logic

### Resend Client Setup

```typescript
// src/app/api/contact/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Sending Emails

```typescript
// User confirmation email
async function sendUserConfirmation(
  to: string,
  name: string,
  subject: string
): Promise<void> {
  const htmlTemplate = getUserConfirmationTemplate(name, subject);

  await resend.emails.send({
    from: `Aviators Training Centre <${process.env.FROM_EMAIL}>`,
    to: [to],
    subject: 'Thank you for contacting Aviators Training Centre',
    html: htmlTemplate,
  });
}

// Owner notification email
async function sendOwnerNotification(
  formData: ContactFormData
): Promise<void> {
  const htmlTemplate = getOwnerNotificationTemplate(formData);

  await resend.emails.send({
    from: `Aviators Training Centre <${process.env.FROM_EMAIL}>`,
    to: [
      process.env.OWNER1_EMAIL!,
      process.env.OWNER2_EMAIL!,
    ],
    subject: `New Contact: ${formData.subject} from ${formData.name}`,
    html: htmlTemplate,
    replyTo: formData.email,
  });
}
```

### Email Templates

```typescript
// User confirmation template
function getUserConfirmationTemplate(name: string, subject: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You - Aviators Training Centre</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
          <img src="https://www.aviatorstrainingcentre.in/logo.png" alt="ATC Logo" style="height: 50px;">
          <h1 style="color: white; margin: 15px 0 0;">Thank You!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Dear ${name},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for reaching out to Aviators Training Centre regarding <strong>"${subject}"</strong>.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Our team has received your message and will get back to you within 24 hours.
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>What's Next?</strong><br>
              Our training coordinator will review your inquiry and contact you with personalized course recommendations.
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.aviatorstrainingcentre.in/courses" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Explore Our Courses
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666;">
          <p style="margin: 0;">Aviators Training Centre</p>
          <p style="margin: 5px 0;">India's Premier Aviation Training Institute</p>
          <p style="margin: 10px 0 0;">
            <a href="https://www.aviatorstrainingcentre.in" style="color: #3b82f6;">www.aviatorstrainingcentre.in</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Owner notification template
function getOwnerNotificationTemplate(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 30px;">
        <h2 style="color: #1e40af; margin-top: 0;">New Contact Form Submission</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <a href="mailto:${data.email}" style="color: #3b82f6;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              ${data.phone ? `<a href="tel:${data.phone}" style="color: #3b82f6;">${data.phone}</a>` : 'Not provided'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.subject}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #333;">Message:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap;">
${data.message}
          </div>
        </div>
        
        ${data.utm_source ? `
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px;">
          <h4 style="color: #92400e; margin-top: 0;">Traffic Source</h4>
          <p style="margin: 0; color: #78350f;">
            Source: ${data.utm_source || 'Direct'}<br>
            Medium: ${data.utm_medium || 'N/A'}<br>
            Campaign: ${data.utm_campaign || 'N/A'}
          </p>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://www.aviatorstrainingcentre.in/admin/leads" 
             style="display: inline-block; background: #16a34a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px;">
            View in Dashboard
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
          Sent at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
      </div>
    </body>
    </html>
  `;
}
```

---

## Error Handling

### Rate Limit Handling

```typescript
async function sendEmailWithRetry(
  emailConfig: EmailConfig,
  maxRetries = 3
): Promise<void> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await resend.emails.send(emailConfig);
      return;
    } catch (error: any) {
      lastError = error;

      // Rate limit hit - wait and retry
      if (error.statusCode === 429) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        await delay(waitTime);
        continue;
      }

      // Other error - don't retry
      throw error;
    }
  }

  throw lastError;
}
```

### Non-Blocking Email

```typescript
// In contact form handler
export async function POST(req: NextRequest) {
  const formData = await req.json();

  // Save to database first (critical)
  const contactId = await saveToFirebase(formData);

  // Send emails (non-blocking)
  Promise.all([
    sendUserConfirmation(formData.email, formData.name, formData.subject),
    sendOwnerNotification(formData),
  ]).catch(error => {
    // Log but don't fail the request
    console.error('Email sending failed:', error);
  });

  return NextResponse.json({ 
    success: true, 
    id: contactId 
  });
}
```

---

## Environment Variables

```bash
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email addresses
FROM_EMAIL=noreply@aviatorstrainingcentre.in
OWNER1_EMAIL=owner1@aviatorstrainingcentre.in
OWNER2_EMAIL=owner2@aviatorstrainingcentre.in
```

---

## N8N Integration

The email service also triggers N8N for follow-up sequences:

```typescript
// After sending immediate emails
if (contactId) {
  // Trigger N8N webhook for follow-up sequence
  triggerN8NWebhook({
    ...formData,
    contactId,
    timestamp: new Date().toISOString(),
  }).catch(console.error);
}
```

See [N8N Overview](../n8n/OVERVIEW.md) for follow-up email details.

---

## How to Use

### Send Custom Email

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendCustomEmail() {
  await resend.emails.send({
    from: 'Aviators Training Centre <noreply@aviatorstrainingcentre.in>',
    to: ['user@example.com'],
    subject: 'Your Course Enrollment',
    html: '<h1>Welcome!</h1><p>You have been enrolled...</p>',
  });
}
```

### Add New Email Template

1. Create template function in `src/lib/email/templates.ts`
2. Export from main email module
3. Use in API route

---

## Extension Guide

### Adding New Email Type

```typescript
// 1. Create template
function getEnrollmentConfirmationTemplate(
  name: string,
  courseName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Enrollment confirmation HTML -->
    </html>
  `;
}

// 2. Create send function
async function sendEnrollmentConfirmation(
  to: string,
  name: string,
  courseName: string
): Promise<void> {
  await resend.emails.send({
    from: `Aviators Training Centre <${process.env.FROM_EMAIL}>`,
    to: [to],
    subject: `Enrollment Confirmed: ${courseName}`,
    html: getEnrollmentConfirmationTemplate(name, courseName),
  });
}

// 3. Export and use
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Emails not sending | Check `RESEND_API_KEY` is valid |
| Rate limit errors | Implement exponential backoff |
| Emails going to spam | Verify domain in Resend dashboard |
| Template not rendering | Check HTML syntax, test inline styles |

---

## Related Documentation

- [Form Validation](form-validation.md)
- [API Integration](../API_INTEGRATION.md)
- [N8N Overview](../n8n/OVERVIEW.md)
