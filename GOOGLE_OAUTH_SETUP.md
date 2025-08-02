# Google OAuth Setup Guide

## 🔧 Setting Up Google OAuth for Sanity Member Authentication

This guide will help you configure Google OAuth authentication that validates against your Sanity workspace members.

## 📋 Prerequisites

- Access to Google Cloud Console
- Admin access to your Sanity project
- Production domain configured

## 🚀 Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**

### 1.2 Create OAuth 2.0 Client ID
1. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
2. Select **Web application** as the application type
3. Give it a name like "Aviators Training Centre Admin"

### 1.3 Configure Authorized URLs
**Authorized JavaScript origins:**
```
https://www.aviatorstrainingcentre.in
https://aviatorstrainingcentre.in
```

**Authorized redirect URIs:**
```
https://www.aviatorstrainingcentre.in/api/auth/google/callback
https://aviatorstrainingcentre.in/api/auth/google/callback
```

### 1.4 Save Credentials
1. Click **Create**
2. Copy the **Client ID** and **Client Secret**
3. Keep these secure - you'll need them for environment variables

## 🔐 Step 2: Configure Environment Variables

Add these to your `.env.production` file:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

## 👥 Step 3: Manage Sanity Workspace Members

### 3.1 Current Authorized Members
The system will validate against these Sanity project members:
- **amansuryavanshi2002@gmail.com** (Administrator)
- **adude890@gmail.com** (Administrator)

### 3.2 Adding New Members
To add new members to your Sanity workspace:

1. Go to [Sanity Management](https://sanity.io/manage)
2. Select your project: **Aviators Training Centre**
3. Go to **Members** tab
4. Click **Invite member**
5. Enter their Google email address
6. Assign role (Administrator or Editor)
7. Send invitation

### 3.3 Member Roles
- **Administrator**: Full access to admin panel and Studio
- **Editor**: Limited access to content editing

## 🔄 Step 4: How Authentication Works

### 4.1 Authentication Flow
1. User clicks "Continue with Google" on login page
2. Redirected to Google OAuth consent screen
3. User authorizes with their Google account
4. Google redirects back with authorization code
5. System exchanges code for user info
6. System validates user email against Sanity workspace members
7. If authorized, user is logged in with JWT tokens

### 4.2 Security Features
- **Email verification required**: Only verified Google accounts
- **Workspace validation**: Must be active Sanity project member
- **Role-based permissions**: Different access levels
- **Secure tokens**: JWT with 15-minute access tokens
- **Session management**: Automatic token refresh

## 🧪 Step 5: Testing the Setup

### 5.1 Test Authentication
1. Visit `/login` on your site
2. Click "Continue with Google"
3. Login with an authorized Google account
4. Should redirect to admin dashboard

### 5.2 Test Unauthorized Access
1. Try logging in with a non-member Google account
2. Should see "Access denied" message
3. Only Sanity workspace members should be allowed

### 5.3 Debug Authentication
Visit `/test-auth` to see:
- Current authentication status
- Cookie information
- Test login/logout functionality

## 🛠️ Troubleshooting

### Common Issues

#### "OAuth Error: redirect_uri_mismatch"
- Check that redirect URIs in Google Console match exactly
- Ensure you're using the correct domain (with/without www)
- Verify HTTPS is being used

#### "Access denied" for valid members
- Check that user email matches exactly in Sanity workspace
- Verify user is active in Sanity project
- Check that Google account email is verified

#### "Client ID not configured"
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Check environment variables are deployed
- Restart application after adding variables

### Debug Steps
1. Check `/api/studio/health` for configuration status
2. Use browser developer tools to check network requests
3. Check server logs for authentication errors
4. Verify environment variables are loaded

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit OAuth secrets to version control
- Use different credentials for development/production
- Rotate secrets regularly

### 2. Domain Security
- Only add necessary redirect URIs
- Use HTTPS in production
- Validate all redirect URLs

### 3. Member Management
- Regularly review Sanity workspace members
- Remove inactive members promptly
- Use principle of least privilege for roles

## 📞 Support

If you encounter issues:

1. **Check Google Cloud Console** for OAuth configuration
2. **Verify Sanity workspace members** are correctly configured
3. **Test with `/test-auth`** page for debugging
4. **Check browser console** for client-side errors
5. **Review server logs** for authentication failures

## 🎯 Next Steps

After successful setup:

1. **Test with all authorized members**
2. **Set up monitoring** for authentication failures
3. **Document member onboarding** process
4. **Consider adding 2FA** for additional security
5. **Regular security audits** of OAuth configuration

---

**Status**: ✅ Google OAuth Ready for Configuration