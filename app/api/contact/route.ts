import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

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

// Function to read and process email templates
function getEmailTemplate(templateName: string, variables: Record<string, string>): string {
  try {
    const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      template = template.replace(regex, value);
    });
    
    return template;
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error);
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
    let formData;
    try {
      formData = await req.json();
      console.log('Received form data:', JSON.stringify(formData));
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json({ error: 'Invalid request format. Please send valid JSON data.' }, { status: 400, headers });
    }
    
    const { name, email, phone, subject, message } = formData;

    // --- Validate form data ---
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
        timestamp: serverTimestamp(),
      });
      console.log('Data saved to Firebase with ID:', newContactRef.key);
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500, headers });
    }

    // --- Send Emails using Resend ---
    console.log('Setting up Resend...');
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL;
    const owner1Email = process.env.OWNER1_EMAIL;
    const owner2Email = process.env.OWNER2_EMAIL;

    console.log('Email config check:', { 
      fromEmailExists: !!fromEmail,
      owner1Exists: !!owner1Email,
      owner2Exists: !!owner2Email
    });

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
      console.log('Preparing user confirmation email...');
      
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
        
        console.log('User confirmation email sent successfully:', userEmailResult);
      } else {
        console.error('Failed to load user confirmation template');
      }
    } catch (userEmailError) {
      console.error('Error sending user confirmation email:', userEmailError);
      // Continue execution - don't return error to user if only this email fails
    }

    // 2. Send Notification Emails to Owners
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
      // Send to Owner 1
      try {
        console.log('Preparing owner 1 notification email...');
        
        const owner1EmailResult = await resend.emails.send({
          from: `Aviators Training Centre <${fromEmail}>`,
          to: [owner1Email],
          subject: `New Contact Form Submission from ${name}`,
          html: ownerHtmlContent,
        });
        
        console.log('Owner 1 notification email sent successfully:', owner1EmailResult);
      } catch (owner1EmailError) {
        console.error(`Error sending owner notification email to ${owner1Email}:`, owner1EmailError);
      }

      // Send to Owner 2
      try {
        console.log('Preparing owner 2 notification email...');
        
        const owner2EmailResult = await resend.emails.send({
          from: `Aviators Training Centre <${fromEmail}>`,
          to: [owner2Email],
          subject: `New Contact Form Submission from ${name}`,
          html: ownerHtmlContent,
        });
        
        console.log('Owner 2 notification email sent successfully:', owner2EmailResult);
      } catch (owner2EmailError) {
        console.error(`Error sending owner notification email to ${owner2Email}:`, owner2EmailError);
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