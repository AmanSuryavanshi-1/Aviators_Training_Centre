import { NextRequest, NextResponse } from 'next/server';
import { initFirebase } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { Resend } from 'resend';
import { triggerContactFormWebhook } from '@/lib/n8n/contact-webhook';

// Define allowed methods and ensure dynamic content
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// TypeScript interface for form data
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  source_description?: string;
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

  return new NextResponse(null, { status: 204, headers });
}

// Email templates embedded directly in code for production compatibility
const EMAIL_TEMPLATES = {
  'user-confirmation': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #0066cc;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
        }
        .content {
            margin-bottom: 20px;
        }
        .message-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You, {{ name }}!</h1>
        </div>
        
        <div class="content">
            <p>We've received your query and will respond shortly.</p>
            
            <p><strong>Your message:</strong></p>
            <div class="message-box">
                {{ message }}
            </div>
            
            <div class="contact-info">
                <p>If you have any additional questions, reply to this email or contact us directly.</p>
                <p><strong>Email:</strong> aviatorstrainingcentre@gmail.com</p>
                <p><strong>Phone:</strong> +91 9485687609</p>
            </div>
        </div>
        
        <div class="footer">
            © Aviators Training Centre
        </div>
    </div>
</body>
</html>`,
  'owner-notification': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #0066cc;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
        }
        .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #0066cc;
        }
        .field-label {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        .field-value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        
        <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">{{ name }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">{{ email }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Phone</div>
            <div class="field-value">{{ phone }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Subject</div>
            <div class="field-value">{{ subject }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Message</div>
            <div class="field-value">{{ message }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Time</div>
            <div class="field-value">{{ timestamp }}</div>
        </div>
        
        <div class="footer">
            © {{ year }} Aviators Training Centre
        </div>
    </div>
</body>
</html>`
};

// Function to process email templates
function getEmailTemplate(templateName: string, variables: Record<string, string>): string {
  try {
    let template = EMAIL_TEMPLATES[templateName as keyof typeof EMAIL_TEMPLATES];

    if (!template) {
      console.error(`Template ${templateName} not found`);
      return '';
    }

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      template = template.replace(regex, value);
    });

    return template;
  } catch (error) {
    console.error(`Error processing template ${templateName}:`, error);
    return '';
  }
}

export async function POST(req: NextRequest) {
  // Set CORS headers for all responses
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight request (should be handled by OPTIONS function, but adding as fallback)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    // Improved error handling for JSON parsing
    let formData: ContactFormData;
    try {
      formData = await req.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Received form data:', JSON.stringify(formData));
      }
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ error: 'Invalid request format. Please send valid JSON data.' }, { status: 400, headers });
    }

    const {
      name,
      email,
      phone,
      subject,
      message,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      landing_page,
      source_description
    } = formData;

    // --- Validate form data ---
    if (!name || !email || !subject || !message) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Missing required fields:', { name, email, subject, message });
      }
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers });
    }

    // Log UTM tracking data in development
    if (process.env.NODE_ENV === 'development' && (utm_source || referrer)) {
      console.log('📊 UTM Tracking Data:', {
        utm_source,
        utm_medium,
        utm_campaign,
        referrer,
        landing_page,
        source_description
      });
    }

    // --- Save to Firebase Realtime Database with timeout ---
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting to save to Firebase...');
      }
      const { db } = await initFirebase();
      const contactsRef = ref(db, 'contacts');

      // Add timeout to prevent hanging
      // Prepare data for Firebase with UTM tracking
      const firebaseData = {
        // Contact information
        name,
        email,
        phone: phone || '',
        subject,
        message,

        // UTM tracking data
        utm_source: utm_source || '',
        utm_medium: utm_medium || '',
        utm_campaign: utm_campaign || '',
        utm_content: utm_content || '',
        utm_term: utm_term || '',
        referrer: referrer || 'direct',
        landing_page: landing_page || '',
        source_description: source_description || 'Direct Traffic',

        // Metadata
        timestamp: serverTimestamp(),
        submitted_at: new Date().toISOString(),
      };

      const savePromise = push(contactsRef, firebaseData);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firebase operation timed out')), 10000); // 10 second timeout
      });

      const newContactRef = await Promise.race([savePromise, timeoutPromise]) as any;
      if (process.env.NODE_ENV === 'development') {
        console.log('Data saved to Firebase with ID:', newContactRef?.key);
      }

      // --- Trigger n8n webhook after successful Firebase storage ---
      if (newContactRef?.key) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 About to trigger n8n webhook with form data:', {
            formId: newContactRef.key,
            formData: formData
          });
        }
        try {
          await triggerContactFormWebhook(formData, newContactRef.key);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Webhook trigger completed successfully');
          }
        } catch (webhookError) {
          // Webhook errors should not affect form submission - just log them
          console.error('❌ Webhook trigger failed after Firebase storage:', webhookError);
        }
      }
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);

      // If it's a timeout or connection error, still return success to user
      // but log the error for debugging
      if (firebaseError.message?.includes('timeout') || firebaseError.message?.includes('region')) {
        console.error('Firebase database issue detected, but continuing with email processing');
        // Trigger webhook even if Firebase failed (use timestamp as fallback ID)
        const fallbackId = `fallback-${Date.now()}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 Triggering n8n webhook with fallback ID after Firebase error:', fallbackId);
        }
        try {
          await triggerContactFormWebhook(formData, fallbackId);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Fallback webhook trigger completed successfully');
          }
        } catch (webhookError) {
          // Webhook errors should not affect form submission - just log them
          console.error('❌ Webhook trigger failed after Firebase error:', webhookError);
        }
        // Don't return error - continue with email sending
      } else {
        return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500, headers });
      }
    }

    // --- Send Emails using Resend ---
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up Resend...');
      console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL;
    const owner1Email = process.env.OWNER1_EMAIL;
    const owner2Email = process.env.OWNER2_EMAIL;

    if (process.env.NODE_ENV === 'development') {
      console.log('Email config check:', {
        fromEmailExists: !!fromEmail,
        owner1Exists: !!owner1Email,
        owner2Exists: !!owner2Email
      });
    }

    if (!fromEmail || !owner1Email || !owner2Email) {
      console.error('Missing email configuration in environment variables.');
      console.error('Required env vars:', {
        fromEmail: !!fromEmail,
        owner1Email: !!owner1Email,
        owner2Email: !!owner2Email
      });
      // Still return success to the user, but log the error server-side
      return NextResponse.json({
        message: 'Form submitted successfully! Your message has been saved and you will receive a response soon.',
        warning: 'Email notifications may be delayed due to configuration issues.'
      }, { status: 200, headers });
    }

    // Prepare template variables
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const year = currentDate.getFullYear().toString();

    // 1. Send Confirmation Email to User
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Preparing user confirmation email...');
      }

      const userTemplateVariables = {
        name: name,
        message: message
      };

      const userHtmlContent = getEmailTemplate('user-confirmation', userTemplateVariables);

      if (userHtmlContent) {
        const userEmailResult = await resend.emails.send({
          from: `Aviators Training Centre <${fromEmail}>`,
          to: [email],
          subject: 'Thank you for contacting Aviators Training Centre',
          html: userHtmlContent,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('User confirmation email sent successfully:', userEmailResult);
        }
      } else {
        console.error('Failed to load user confirmation template');
      }
    } catch (userEmailError) {
      console.error('Error sending user confirmation email:', userEmailError);
      // Continue execution - don't return error to user if only this email fails
    }

    // 2. Send Notification Emails to Both Owners (single API call to avoid rate limits)
    const ownerTemplateVariables = {
      name: name,
      email: email,
      phone: phone || 'N/A',
      subject: subject,
      message: message,
      timestamp: timestamp,
      year: year
    };

    const ownerHtmlContent = getEmailTemplate('owner-notification', ownerTemplateVariables);

    if (ownerHtmlContent) {
      // Send to both owners in a single API call
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Preparing owner notification emails for both owners...');
        }

        const ownerEmailResult = await resend.emails.send({
          from: `Aviators Training Centre <${fromEmail}>`,
          to: [owner1Email, owner2Email], // Send to both owners at once
          subject: `New Contact Form Submission from ${name}`,
          html: ownerHtmlContent,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('Owner notification emails sent successfully to both owners:', ownerEmailResult);
        }
      } catch (ownerEmailError) {
        console.error('Error sending owner notification emails:', ownerEmailError);

        // Fallback: Try sending individually with delay if batch sending fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting to send owner emails individually as fallback...');
        }

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('Sending to owner 1...');
          }
          const owner1EmailResult = await resend.emails.send({
            from: `Aviators Training Centre <${fromEmail}>`,
            to: [owner1Email],
            subject: `New Contact Form Submission from ${name}`,
            html: ownerHtmlContent,
          });
          if (process.env.NODE_ENV === 'development') {
            console.log('Owner 1 notification email sent successfully:', owner1EmailResult);
          }

          // Wait 1 second to respect rate limits
          if (process.env.NODE_ENV === 'development') {
            console.log('Waiting 1 second before sending to owner 2...');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (process.env.NODE_ENV === 'development') {
            console.log('Sending to owner 2...');
          }
          const owner2EmailResult = await resend.emails.send({
            from: `Aviators Training Centre <${fromEmail}>`,
            to: [owner2Email],
            subject: `New Contact Form Submission from ${name}`,
            html: ownerHtmlContent,
          });
          if (process.env.NODE_ENV === 'development') {
            console.log('Owner 2 notification email sent successfully:', owner2EmailResult);
          }

        } catch (fallbackError) {
          console.error('Fallback email sending also failed:', fallbackError);
        }
      }
    } else {
      console.error('Failed to load owner notification template');
    }

    // --- Return Success Response with CORS headers ---
    return NextResponse.json({ message: 'Form submitted successfully!' }, { status: 200, headers });

  } catch (error) {
    console.error('Error processing contact form:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: 'Failed to process form submission.' }, { status: 500, headers });
  }
}
