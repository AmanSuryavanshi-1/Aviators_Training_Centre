# Aviators Training Centre - N8N Workflow Documentation

## Overview
This document outlines the automation architecture for the Aviators Training Centre, focusing on three core workflows:
1.  **New Lead Processing** (Contact Form Submission)
2.  **Booking Management** (Cal.com Booking Created)
3.  **Cancellation Handling** (Cal.com Booking Cancelled)

These workflows automate the journey from initial contact to consultation booking and management, ensuring consistent communication and data integrity in Airtable.

---

## 1. Data Entry Point: Website Contact Form
**Source:** `https://aviatorstrainingcentre.in/contact`

When a user submits the contact form, the data flows as follows:

1.  **Frontend Capture (`ContactFormCard.tsx`)**:
    *   User fills out: Name, Email, Phone (optional), Subject, Message.
    *   System captures: `utm_source`, `referrer`, and detects if it is a "Demo Booking".
2.  **API Processing (`contact-webhook.ts`)**:
    *   The form data is sanitized and structured into a flat JSON payload.
    *   **Payload sent to N8N:**
        *   `name`: User's full name
        *   `email`: User's email address
        *   `phone`: Phone number
        *   `subject`: Selected subject or "Demo Request"
        *   `message`: User's inquiry
        *   `isDemoBooking`: Boolean flag
        *   `timestamp`: Submission time (ISO format)
        *   `formId`: Unique ID
3.  **Trigger:** A Webhook POST request is sent to the N8N `Firebase Database Trigger` workflow.

---

## 2. Workflow Breakdown

### Workflow A: New Lead Automation (`ATC_FirebaseDB_1st_Trigger.json`)
**Purpose:** Handles initial contact inquiries and drives users to book a consultation.

**Flow Steps:**
1.  **Trigger:** Receives data from the website via Webhook.
2.  **Validation:** Checks if `email` and `name` exist.
3.  **Action - Email Response:**
    *   Sends an immediate "Schedule Your Free Consultation" email.
    *   Contains a personalized link to Cal.com with `name` and `email` pre-filled.
4.  **Action - Database Entry (Airtable):**
    *   Creates a new record in the "Direct Leads" table.
    *   Sets Status to **"Email Sent"**.
    *   Maps: Name, Email, Phone, Subject, Message.
5.  **Delay:** Waits for **48 hours**.
6.  **Status Check:**
    *   Searches Airtable to see if the user has booked a meeting (checked via Email).
    *   **Logic:**
        *   *If Status is still "Email Sent"* (meaning they haven't booked):
            *   **Action:** Send "Follow-up Email" (Urgency: "Limited Time Opportunity").
            *   **Update:** Change Airtable Status to **"Follow Up Sent"**.
        *   *If Status has changed* (e.g., to "Confirmed"):
            *   **Action:** Do nothing (Stop).

### Workflow B: New Booking Management (`ATC_CAL.com_2nd_Trigger.json`)
**Purpose:** Manages confirmed bookings from Cal.com and updates the lead database.

**Flow Steps:**
1.  **Trigger:** `BOOKING_CREATED` event from Cal.com.
2.  **Data Validation & Sanitization:**
    *   Ensures valid email, correct data types, and sanitizes input strings to prevent injection.
3.  **Duplicate Check:**
    *   Searches Airtable for an existing lead with the same Email.
    *   *Logic:* Handles duplicate records by selecting the most recent one.
    *   *If no lead found:* Prepares to create a new one.
4.  **Action - Send Confirmation:**
    *   Sends a "Consultation Confirmed" email with meeting details (Date, Time IST, Link).
    *   Includes "Add to Calendar" and WhatsApp contact buttons.
5.  **Database Sync (Airtable):**
    *   **If User Exists:** Updates the existing record.
    *   **If New User:** Creates a new record.
    *   **Updates/Sets:**
        *   Status: **"Confirmed"**
        *   Meeting Date/Time/Title
        *   Booking ID & Cal.com URL
6.  **Monitoring:** Logs execution metrics (Success/Failure, Duration) for system health tracking.

### Workflow C: Cancellation Handling (`ATC_Booking_Cancellation.json`)
**Purpose:** Handles cancellations gracefully and attempts to re-engage the user.

**Flow Steps:**
1.  **Trigger:** `BOOKING_CANCELLED` event from Cal.com.
2.  **Database Lookup:** Finds the booking in Airtable using the `Booking ID`.
3.  **Action - Update Status:**
    *   Updates Airtable record Status to **"Cancelled"**.
    *   Adds a note: "Booking cancelled by user on [Date]".
4.  **Action - Send Cancellation Notice:**
    *   Sends a polite "Consultation Cancelled" email.
    *   Includes a link to **RescheduleImmediately**.
5.  **Delay:** Waits for **7 Days**.
6.  **Re-engagement:**
    *   **Action:** Send "Still Interested?" follow-up email.
    *   **Update:** Changes Airtable Status to **"Follow Up Sent"**.

---

## Technical Data Flow Summary

| Stage | Source | Data Transfer | Destination | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Inquiry** | Website Form | API/Webhook (JSON) | N8N Workflow A | Send Intro Email + Create DB Entry |
| **Booking** | Cal.com | Webhook (BOOKING_CREATED) | N8N Workflow B | Find/Update DB + Send Confirmation |
| **Cancel** | Cal.com | Webhook (BOOKING_CANCELLED) | N8N Workflow C | Update DB Status + Re-engagement Loop |
