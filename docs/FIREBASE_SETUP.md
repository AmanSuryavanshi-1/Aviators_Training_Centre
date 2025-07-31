# Firebase Setup Guide

This guide explains how to set up Firebase Admin SDK credentials for the blog analytics system.

## Prerequisites

- Access to the Firebase Console for the `aviators-training-centre---atc` project
- Admin permissions to generate service account keys

## Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `aviators-training-centre---atc` project
3. Navigate to **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file (keep it secure!)

## Step 2: Extract Credentials

From the downloaded JSON file, you'll need two values:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aviators-training-centre---atc.iam.gserviceaccount.com"
}
```

## Step 3: Update Environment Variables

In your `.env.local` file, replace the placeholder values:

```bash
# Replace this placeholder:
FIREBASE_PRIVATE_KEY="PLACEHOLDER_NOT_CONFIGURED"

# With the actual private key (keep the quotes and escape sequences):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Replace this placeholder:
FIREBASE_CLIENT_EMAIL="PLACEHOLDER_NOT_CONFIGURED"

# With the actual client email:
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@aviators-training-centre---atc.iam.gserviceaccount.com"
```

## Important Notes

- **Keep the quotes** around the private key value
- **Keep the `\n` escape sequences** in the private key - they represent line breaks
- **Never commit** the actual credentials to version control
- The private key should start with `-----BEGIN PRIVATE KEY-----` and end with `-----END PRIVATE KEY-----`

## Verification

After updating the credentials:

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/admin` 
3. Check the System Status Dashboard - Firebase should show as "healthy"
4. Check the browser console for any Firebase-related errors

## Troubleshooting

### "Invalid PEM formatted message" Error
- Ensure the private key includes the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers
- Verify that `\n` sequences are present in the key (they represent line breaks)
- Make sure the entire key is wrapped in quotes

### "Permission denied" Error
- Verify the service account has the necessary permissions
- Ensure you're using the correct project ID
- Check that the service account hasn't been disabled

### "Project not found" Error
- Verify `FIREBASE_PROJECT_ID=aviators-training-centre---atc` is correct
- Ensure the project exists and you have access to it

## Security Best Practices

1. **Never share** service account keys
2. **Rotate keys regularly** (every 90 days recommended)
3. **Use environment-specific** service accounts for production vs development
4. **Monitor usage** in Firebase Console for unusual activity
5. **Revoke unused keys** immediately

## Current System Status

Until proper credentials are configured:
- ✅ Blog functionality works (uses Sanity CMS)
- ❌ Analytics tracking is disabled
- ❌ Admin dashboard analytics are unavailable
- ❌ Contact form submissions won't be stored in Firestore

Once configured:
- ✅ Full analytics tracking
- ✅ Real-time admin dashboard
- ✅ Contact form data storage
- ✅ Performance monitoring