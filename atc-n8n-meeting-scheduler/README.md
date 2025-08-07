# ATC Meeting Scheduler Module

_Automated Lead Capture and Follow-up System for Aviators Training Centre_

## Overview

The ATC Meeting Scheduler is a sophisticated automation system that streamlines the entire lead management process for the Aviators Training Centre. It automatically captures leads from the website, sends personalized consultation booking emails, and implements an intelligent follow-up system to maximize conversion rates.

## Business Context

**Problem Solved**: Manual lead management was time-consuming and led to missed opportunities. Potential clients would fill out contact forms but wouldn't receive immediate responses, resulting in lost conversions.

**Solution**: This automation ensures every lead receives immediate attention with personalized emails and strategic follow-ups, significantly improving the conversion rate from inquiry to booked consultation.

## System Architecture

The module consists of two interconnected n8n workflows:

```
Website Contact Form → Firebase DB → Workflow 1 (Lead Capture)
                                         ↓
                                   Send Initial Email
                                         ↓
                                   Create Airtable Record
                                         ↓
                                   Wait 48 Hours
                                         ↓
                                   Check Status → Send Follow-up (if needed)

Cal.com Booking → Workflow 2 (Booking Confirmation)
                      ↓
                Send Confirmation Email
                      ↓
                Update Airtable Status
```

## Prerequisites

### Required Services and API Keys

1. **Firebase Realtime Database**

   - Project with Realtime Database enabled
   - Database URL and service account credentials
   - Connected to website contact form

2. **Gmail Account (OAuth2)**

   - Google Cloud Console project
   - OAuth 2.0 Client ID configured
   - Gmail API enabled

3. **Airtable Account**

   - Workspace with "Leads" table
   - API key with read/write permissions
   - Table structure: Name, Email, Phone, Status, Notes, Booking Details

4. **Cal.com Account**

   - Booking page configured
   - Webhook endpoint configured
   - API key for integration

5. **n8n Instance**
   - Self-hosted with public webhook URL
   - Cloudflare tunnel or similar for public access

### Environment Variables

Add these to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Gmail OAuth (configured in n8n credentials)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret

# Airtable Configuration
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-base-id
AIRTABLE_TABLE_ID=your-table-id

# Cal.com Configuration
CALCOM_API_KEY=your-calcom-api-key
```

## Installation and Setup

### Step 1: Import Workflows

1. Open your n8n instance
2. Navigate to Workflows → Import from File
3. Import both workflow files:
   - `ATC_FirebaseDB_1st_Trigger.json` (Lead Capture)
   - `ATC_CAL.com_2nd_Trigger.json` (Booking Confirmation)

### Step 2: Configure Firebase Credentials

1. In n8n, go to Credentials → Add Credential
2. Select "Firebase Realtime Database"
3. Upload your Firebase service account JSON file
4. Test the connection

### Step 3: Configure Gmail OAuth2

1. In Google Cloud Console:
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://your-n8n-domain.com/rest/oauth2-credential/callback`
2. In n8n:
   - Create Gmail OAuth2 credential
   - Enter Client ID and Client Secret
   - Complete OAuth flow

### Step 4: Configure Airtable

1. Create Airtable base with "Leads" table
2. Required columns:
   - Name (Single line text)
   - Email (Email)
   - Phone (Phone number)
   - Status (Single select: "Email Sent", "Follow-up Sent", "Confirmed")
   - Notes (Long text)
   - Booking Details (Long text)
3. In n8n, create Airtable credential with your API key

### Step 5: Configure Cal.com

1. Set up your booking page in Cal.com
2. Configure webhook to point to your n8n webhook URL
3. Create Cal.com credential in n8n with API key

### Step 6: Update Workflow Configuration

1. **Lead Capture Workflow**:

   - Update Firebase database path
   - Customize email templates
   - Set follow-up delay (default: 48 hours)
   - Configure Airtable table/base IDs

2. **Booking Confirmation Workflow**:
   - Update Cal.com webhook settings
   - Customize confirmation email template
   - Configure Airtable update logic

## How to Run and Test

### Testing Lead Capture Flow

1. **Activate the Lead Capture Workflow**
2. **Submit a test form** on your website
3. **Verify the flow**:
   - Check Firebase for new entry
   - Confirm initial email was sent
   - Verify Airtable record creation
   - Wait for follow-up delay (or reduce for testing)
   - Confirm follow-up email if status unchanged

### Testing Booking Confirmation Flow

1. **Activate the Booking Confirmation Workflow**
2. **Book a test appointment** via Cal.com
3. **Verify the flow**:
   - Check confirmation email delivery
   - Verify Airtable status update to "Confirmed"
   - Confirm booking details are recorded

### End-to-End Testing

1. Submit contact form → Receive initial email
2. Click booking link → Schedule appointment
3. Receive confirmation email
4. Verify complete lead journey in Airtable

## Configuration Options

### Email Templates

Customize email content in the workflow nodes:

```html
<!-- Initial Consultation Email -->
<h2>Thank you for your interest in pilot training!</h2>
<p>Hi {{$json.name}},</p>
<p>We're excited to help you achieve your aviation dreams...</p>
<a href="https://cal.com/your-booking-page">Schedule Your Free Consultation</a>

<!-- Follow-up Email -->
<h2>Don't miss your chance for a free consultation</h2>
<p>Hi {{$json.name}},</p>
<p>We noticed you haven't scheduled your consultation yet...</p>
```

### Follow-up Timing

Adjust the wait period in the Lead Capture workflow:

- **Production**: 48 hours (172800 seconds)
- **Testing**: 3 seconds for immediate testing
- **Custom**: Set any duration based on your strategy

### Status Management

The system uses these status values:

- **"Email Sent"**: Initial email delivered, awaiting booking
- **"Follow-up Sent"**: Follow-up email sent, no further automation
- **"Confirmed"**: Consultation booked, lead converted

## Best Practices

### Email Deliverability

- Use authenticated Gmail account
- Include unsubscribe links
- Personalize email content
- Monitor spam rates

### Data Management

- Regularly backup Airtable data
- Clean up old lead records
- Monitor Firebase usage limits
- Archive completed leads

### Performance Optimization

- Use targeted Airtable queries with `filterByFormula`
- Implement error handling for API failures
- Monitor workflow execution times
- Set appropriate retry policies

## Troubleshooting

### Common Issues and Solutions

#### Issue: Follow-up emails sent to all leads

**Cause**: Airtable query fetching all records instead of specific lead
**Solution**: Ensure `filterByFormula` uses correct email filter:

```javascript
{Email} = "{{ $('Firebase Database Trigger').item.json.email }}"
```

#### Issue: Workflows not triggering

**Cause**: Webhook URLs not properly configured
**Solution**:

1. Verify n8n has public URL via Cloudflare tunnel
2. Update webhook URLs in Firebase and Cal.com
3. Test webhook endpoints manually

#### Issue: Gmail authentication failures

**Cause**: OAuth2 credentials expired or misconfigured
**Solution**:

1. Refresh OAuth2 token in n8n credentials
2. Verify redirect URI in Google Cloud Console
3. Check Gmail API quotas

#### Issue: Airtable API errors

**Cause**: Rate limiting or permission issues
**Solution**:

1. Implement retry logic with exponential backoff
2. Verify API key permissions
3. Check Airtable base/table IDs

#### Issue: Firebase connection timeouts

**Cause**: Network issues or incorrect configuration
**Solution**:

1. Verify Firebase service account credentials
2. Check database URL format
3. Test connection from n8n credentials page

### Debugging Steps

1. **Check n8n execution logs**:

   ```bash
   docker-compose logs -f n8n
   ```

2. **Test individual nodes**:

   - Use n8n's "Execute Node" feature
   - Verify data flow between nodes
   - Check node configuration

3. **Validate external services**:

   - Test Firebase database access
   - Verify Gmail API quotas
   - Check Airtable API responses
   - Confirm Cal.com webhook delivery

4. **Monitor data flow**:
   - Check Firebase for new entries
   - Verify Airtable record creation/updates
   - Confirm email delivery in Gmail Sent folder

## Performance Metrics

### Key Performance Indicators (KPIs)

- **Lead Response Time**: < 2 minutes from form submission
- **Email Delivery Rate**: > 95% successful delivery
- **Follow-up Conversion Rate**: Track bookings after follow-up
- **System Uptime**: > 99% workflow availability

### Monitoring

Set up monitoring for:

- Workflow execution failures
- API rate limit warnings
- Email bounce rates
- Database connection issues

## Security Considerations

### Data Protection

- All API keys stored in n8n credentials (encrypted)
- Personal data handled according to privacy policies
- Regular credential rotation recommended

### Access Control

- Limit Airtable permissions to necessary operations
- Use OAuth2 for Gmail (more secure than app passwords)
- Implement webhook signature verification where possible

## Future Enhancements

### Planned Improvements

1. **Multi-channel follow-up**: SMS integration for higher engagement
2. **Lead scoring**: Prioritize leads based on engagement metrics
3. **A/B testing**: Test different email templates and timing
4. **Advanced analytics**: Detailed conversion funnel analysis
5. **CRM integration**: Connect with more comprehensive CRM systems

### Scalability Considerations

- Migrate from SQLite to PostgreSQL for higher volume
- Implement queue system for email sending
- Add load balancing for multiple n8n instances
- Consider serverless architecture for cost optimization

---

_This module represents a production-ready lead management system that has significantly improved conversion rates for the Aviators Training Centre. The intelligent follow-up mechanism ensures no lead is forgotten while maintaining a professional, non-intrusive communication approach._
