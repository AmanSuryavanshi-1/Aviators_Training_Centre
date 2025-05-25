import { NextRequest, NextResponse } from 'next/server';

// Define allowed methods and ensure dynamic content
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  return new NextResponse(null, { status: 204, headers });
}

import { db } from '@/lib/firebase'; // Assuming firebase.js exports db
import { ref, push, serverTimestamp } from 'firebase/database';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

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
    let formData;
    try {
      formData = await req.json();
      console.log('Received form data:', JSON.stringify(formData));
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ error: 'Invalid request format. Please send valid JSON data.' }, { status: 400, headers });
    }
    const { name, email, phone, subject, message } = formData;

    // --- Validate form data (add more robust validation as needed) ---
    if (!name || !email || !subject || !message) {
      console.log('Missing required fields:', { name, email, subject, message });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers });
    }

    // --- Save to Firebase Realtime Database ---
    try {
      console.log('Attempting to save to Firebase...');
      const contactsRef = ref(db, 'contacts');
    const newContactRef = await push(contactsRef, {
      ...formData,
      timestamp: serverTimestamp(), // Use server timestamp
    });
    console.log('Data saved to Firebase with ID:', newContactRef.key);
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500, headers });
    }

    // --- Send Emails using MailerSend ---
    // --- Initialize MailerSend and email configuration variables ---
    console.log('Setting up MailerSend...');
    console.log('API Key exists:', !!process.env.MAILERSEND_API_KEY);
    
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || '',
    });

    const fromEmail = process.env.FROM_EMAIL;
    const userConfirmationTemplateId = process.env.USER_CONFIRMATION_TEMPLATE_ID;
    const ownerNotificationTemplateId = process.env.OWNER_NOTIFICATION_TEMPLATE_ID;
    const owner1Email = process.env.OWNER1_EMAIL; // Add OWNER1_EMAIL to .env.local
    const owner2Email = process.env.OWNER2_EMAIL; // Add OWNER2_EMAIL to .env.local

    console.log('Email config check:', { 
      fromEmailExists: !!fromEmail,
      userTemplateExists: !!userConfirmationTemplateId,
      ownerTemplateExists: !!ownerNotificationTemplateId,
      owner1Exists: !!owner1Email,
      owner2Exists: !!owner2Email
    });

    if (!fromEmail || !userConfirmationTemplateId || !ownerNotificationTemplateId || !owner1Email || !owner2Email) {
        console.error('Missing email configuration in environment variables.');
        console.error('Required env vars:', {
          fromEmail: !!fromEmail,
          userConfirmationTemplateId: !!userConfirmationTemplateId,
          ownerNotificationTemplateId: !!ownerNotificationTemplateId,
          owner1Email: !!owner1Email,
          owner2Email: !!owner2Email
        });
        // Still return success to the user, but log the error server-side
        return NextResponse.json({ 
          message: 'Form submitted successfully! Your message has been saved and you will receive a response soon.',
          warning: 'Email notifications may be delayed due to configuration issues.'
        }, { status: 200, headers });
    }

    const sentFrom = new Sender(fromEmail, 'Aviators Training Centre');

    // 1. Send Confirmation Email to User
    try {
      console.log('Preparing user confirmation email...');
      const userRecipients = [new Recipient(email, name)];
    const userPersonalization = [
      {
        email: email,
        data: {
          name: name,
          subject: subject,
          message: message,
          // Add any other variables your template uses
        },
      },
    ];

    const userEmailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(userRecipients)
      .setTemplateId(userConfirmationTemplateId)
      .setPersonalization(userPersonalization);

      await mailersend.email.send(userEmailParams);
      console.log('User confirmation email sent successfully to:', email);
    } catch (userEmailError) {
      console.error('Error sending user confirmation email:', userEmailError);
      // Continue execution - don't return error to user if only this email fails
    }

    // 2. Send Notification Email to Owners (Separate emails)
    const ownerDataBase = {
      name: name,
      email: email,
      phone: phone || 'N/A',
      subject: subject,
      message: message,
      // Add any other variables your template uses
    };

    // Send to Owner 1
    try {
      console.log('Preparing owner 1 notification email...');
      const owner1Recipients = [new Recipient(owner1Email, 'ATC Owner 1')];
    const owner1Personalization = [
      {
        email: owner1Email,
        data: ownerDataBase,
      },
    ];
    const owner1EmailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(owner1Recipients)
      .setTemplateId(ownerNotificationTemplateId)
      .setPersonalization(owner1Personalization);

      await mailersend.email.send(owner1EmailParams);
      console.log('Owner notification email sent successfully to:', owner1Email);
    } catch (owner1EmailError) {
      console.error(`Error sending owner notification email to ${owner1Email}:`, owner1EmailError);
      // Continue execution - don't return error to user if only this email fails
    }

    // Send to Owner 2
    try {
      console.log('Preparing owner 2 notification email...');
      const owner2Recipients = [new Recipient(owner2Email, 'ATC Owner 2')];
    const owner2Personalization = [
      {
        email: owner2Email,
        data: ownerDataBase,
      },
    ];
    const owner2EmailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(owner2Recipients)
      .setTemplateId(ownerNotificationTemplateId)
      .setPersonalization(owner2Personalization);

      await mailersend.email.send(owner2EmailParams);
      console.log('Owner notification email sent successfully to:', owner2Email);
    } catch (owner2EmailError) {
      console.error(`Error sending owner notification email to ${owner2Email}:`, owner2EmailError);
      // Continue execution - don't return error to user if only this email fails
    }

    // --- Return Success Response with CORS headers ---
    return NextResponse.json({ message: 'Form submitted successfully!' }, { status: 200, headers });

  } catch (error) {
    console.error('Error processing contact form:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ error: 'Failed to process form submission.' }, { status: 500, headers });
  }
}