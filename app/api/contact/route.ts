import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Assuming firebase.js exports db
import { ref, push, serverTimestamp } from 'firebase/database';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { name, email, phone, subject, message } = formData;

    // --- Validate form data (add more robust validation as needed) ---
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- Save to Firebase Realtime Database ---
    const contactsRef = ref(db, 'contacts');
    const newContactRef = await push(contactsRef, {
      ...formData,
      timestamp: serverTimestamp(), // Use server timestamp
    });
    console.log('Data saved to Firebase with ID:', newContactRef.key);

    // --- Send Emails using MailerSend ---
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || '',
    });

    const fromEmail = process.env.FROM_EMAIL;
    const userConfirmationTemplateId = process.env.USER_CONFIRMATION_TEMPLATE_ID;
    const ownerNotificationTemplateId = process.env.OWNER_NOTIFICATION_TEMPLATE_ID;
    const owner1Email = process.env.OWNER1_EMAIL; // Add OWNER1_EMAIL to .env.local
    const owner2Email = process.env.OWNER2_EMAIL; // Add OWNER2_EMAIL to .env.local

    if (!fromEmail || !userConfirmationTemplateId || !ownerNotificationTemplateId || !owner1Email || !owner2Email) {
        console.error('Missing email configuration in environment variables.');
        // Still return success to the user, but log the error server-side
        return NextResponse.json({ message: 'Form submitted successfully, but email configuration error occurred.' }, { status: 200 });
    }

    const sentFrom = new Sender(fromEmail, 'Aviators Training Centre');

    // 1. Send Confirmation Email to User
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

    try {
        await mailersend.email.send(userEmailParams);
        console.log('User confirmation email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending user confirmation email:', error);
        // Decide if you want to return an error to the user or just log it
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

    try {
      await mailersend.email.send(owner1EmailParams);
      console.log('Owner notification email sent successfully to:', owner1Email);
    } catch (error) {
      console.error(`Error sending owner notification email to ${owner1Email}. Full error details:`, JSON.stringify(error, null, 2));
    }

    // Send to Owner 2
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

    try {
      await mailersend.email.send(owner2EmailParams);
      console.log('Owner notification email sent successfully to:', owner2Email);
    } catch (error) {
      console.error(`Error sending owner notification email to ${owner2Email}. Full error details:`, JSON.stringify(error, null, 2));
    }

    // --- Return Success Response ---
    return NextResponse.json({ message: 'Form submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Failed to process form submission.' }, { status: 500 });
  }
}