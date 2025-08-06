# Final Environment Variables List - Post Cleanup

## Overview

This document provides the definitive list of required environment variables for the Aviators Training Centre application after the environment variable cleanup process. All duplicate variables have been removed and the configuration has been optimized for security and maintainability.

## Required Environment Variables

### 🔥 Firebase Client Configuration (Public - Safe to Expose)

These variables are used for client-side Firebase initialization and are safe to expose in the browser:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🔒 Firebase Server Configuration (Private - Server-side Only)

These variables contain sensitive credentials and must remain private:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your_private_key_content]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### 🔐 Authentication Configuration

```env
JWT_SECRET=your_64_character_jwt_secret_for_general_authentication
ADMIN_JWT_SECRET=your_64_character_admin_jwt_secret_for_admin_sessions
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_admin_password
```

### 📧 Email Service Configuration

```env
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@your-domain.com
OWNER1_EMAIL=your-primary-email@domain.com
OWNER2_EMAIL=your-secondary-email@domain.com
```

### 🎨 Sanity CMS Configuration

```env
SANITY_API_TOKEN=sk_your_sanity_api_token
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 📊 Analytics Configuration

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🤖 Optional: AI Integration (if using Kiro features)

```env
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key
```

## Variable Categories Explained

### Public vs Private Variables

- **NEXT_PUBLIC_*** variables are exposed to the client-side and are safe to be public
- **Private variables** (without NEXT_PUBLIC_ prefix) are server-side only and contain sensitive data

### Firebase Configuration Logic

- **Client-side Firebase**: Uses NEXT_PUBLIC_ variables for browser-based Firebase SDK initialization
- **Server-side Firebase**: Uses private FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL for admin operations

### Authentication Separation

- **JWT_SECRET**: Used by the general JWT authentication service
- **ADMIN_JWT_SECRET**: Used specifically for admin dashboard session management
- Both serve different purposes and should remain separate

## Removed Variables (No Longer Needed)

The following duplicate variables have been removed during cleanup:

```
❌ FIREBASE_API_KEY (duplicate of NEXT_PUBLIC_FIREBASE_API_KEY)
❌ FIREBASE_AUTH_DOMAIN (duplicate of NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
❌ FIREBASE_DATABASE_URL (duplicate of NEXT_PUBLIC_FIREBASE_DATABASE_URL)
❌ FIREBASE_PROJECT_ID (duplicate of NEXT_PUBLIC_FIREBASE_PROJECT_ID)
❌ FIREBASE_STORAGE_BUCKET (duplicate of NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
❌ FIREBASE_MESSAGING_SENDER_ID (duplicate of NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
❌ FIREBASE_APP_ID (duplicate of NEXT_PUBLIC_FIREBASE_APP_ID)
❌ FIREBASE_MEASUREMENT_ID (duplicate of NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID)
```

## Security Best Practices

1. **Never commit .env.local to version control**
2. **Use different values for development and production**
3. **Rotate secrets regularly, especially JWT secrets**
4. **Validate all environment variables on application startup**
5. **Use strong, randomly generated secrets (minimum 32 characters for JWT secrets)**

## Production Deployment Checklist

- [ ] All required variables are set in production environment
- [ ] Firebase private key is properly formatted with escaped newlines
- [ ] Email addresses are valid and accessible
- [ ] JWT secrets are at least 32 characters long
- [ ] Sanity API token has appropriate permissions
- [ ] Google Analytics measurement ID is correct
- [ ] Site URL matches production domain
- [ ] No duplicate variables are present

## Validation

Use the following command to validate your environment configuration:

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL',
  'JWT_SECRET', 'ADMIN_JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD',
  'RESEND_API_KEY', 'FROM_EMAIL', 'OWNER1_EMAIL', 'OWNER2_EMAIL',
  'SANITY_API_TOKEN', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_GA_MEASUREMENT_ID'
];
const missing = required.filter(v => !process.env[v]);
if (missing.length === 0) {
  console.log('✅ All required environment variables are set');
} else {
  console.log('❌ Missing variables:', missing.join(', '));
}
"
```

## Support

If you encounter issues with environment variable configuration:

1. Verify all variables are properly set using the validation command above
2. Check that private keys are properly escaped
3. Ensure email addresses are valid
4. Confirm JWT secrets are sufficiently long and random
5. Validate Firebase configuration in Firebase Console

---

**Last Updated**: Environment Variable Cleanup - January 2025  
**Status**: ✅ Production Ready