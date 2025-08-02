# Simple Sanity Studio Authentication Setup

## 🎯 **Simple Solution: Use Sanity Studio's Built-in Authentication**

Instead of complex OAuth setup, we're using **Sanity Studio's existing Google authentication** to protect your admin routes. This is much simpler and requires **zero additional configuration**.

## ✅ **How It Works**

### 1. **Authentication Flow**
1. User tries to access `/admin` → redirected to `/login`
2. User clicks "Login with Sanity Studio" → redirected to `/studio`
3. User authenticates with Google in Sanity Studio (existing setup)
4. User is redirected back to `/admin` with authentication

### 2. **No Additional Setup Required**
- ✅ Uses your existing Sanity Studio Google OAuth
- ✅ No need to create new Google Cloud credentials
- ✅ No additional environment variables
- ✅ Works with your current Sanity workspace members

## 🔧 **What Was Implemented**

### 1. **Simplified Middleware**
- Checks for Sanity Studio authentication cookies
- Protects `/admin` routes automatically
- Allows `/studio` access for authentication

### 2. **Simple Login Page**
- Single button: "Login with Sanity Studio"
- Redirects to `/studio` for authentication
- Returns to intended page after login

### 3. **Clean Authentication Service**
- `src/lib/auth/sanity-studio-auth.ts` - Simple auth checking
- No complex JWT tokens or OAuth flows
- Uses Sanity's existing session management

## 🚀 **Testing the Setup**

### 1. **Test Protected Routes**
```bash
# Try accessing admin without auth
curl https://www.aviatorstrainingcentre.in/admin
# Should redirect to /login

# Try accessing studio
curl https://www.aviatorstrainingcentre.in/studio
# Should load Sanity Studio
```

### 2. **Test Authentication Flow**
1. Visit `/admin` → redirects to `/login`
2. Click "Login with Sanity Studio" → redirects to `/studio`
3. Login with your Google account (amansuryavanshi2002@gmail.com)
4. Navigate back to `/admin` → should work

### 3. **Test Authorized Members**
Only these Google accounts can access:
- `amansuryavanshi2002@gmail.com` (Administrator)
- `adude890@gmail.com` (Administrator)

## 📁 **Files Created/Modified**

### New Files
```
src/lib/auth/sanity-studio-auth.ts    - Simple auth service
src/app/api/auth/logout/route.ts      - Simple logout
SIMPLE_SANITY_AUTH_SETUP.md          - This guide
```

### Modified Files
```
src/middleware.ts                     - Simplified middleware
src/app/login/page.tsx               - Simple login page
.env.production                      - Removed OAuth vars
.env.production.example              - Simplified config
src/lib/config/environment.ts       - Removed OAuth validation
scripts/production-startup.js       - Removed OAuth checks
```

### Removed Files (Cleaned up conflicts)
```
src/app/api/auth/login/route.ts      - Complex OAuth login
src/app/api/auth/google/*            - Google OAuth endpoints
src/lib/auth/google-oauth.ts         - OAuth utilities
src/lib/auth/sanity-members.ts       - Complex member validation
src/app/api/auth/refresh/route.ts    - JWT refresh tokens
```

## 🔐 **Security Features**

### 1. **Leverages Existing Security**
- Uses Sanity's proven Google OAuth implementation
- Benefits from Sanity's security updates
- No additional attack surface

### 2. **Workspace Member Validation**
- Only Sanity project members can authenticate
- Automatic sync with workspace changes
- No manual member management needed

### 3. **Simple Session Management**
- Uses Sanity's session cookies
- Automatic session expiration
- Secure cookie handling

## 🎉 **Benefits of This Approach**

### ✅ **Advantages**
1. **Zero Setup**: No Google Cloud Console configuration needed
2. **Uses Existing Auth**: Leverages your Sanity Studio setup
3. **Automatic Sync**: Members managed in Sanity workspace
4. **Simple & Reliable**: Fewer moving parts, less to break
5. **Secure**: Uses Sanity's proven authentication system

### ❌ **Previous Complex Approach Issues**
1. Required Google Cloud Console setup
2. Needed additional environment variables
3. Complex OAuth flow implementation
4. Potential for configuration conflicts
5. More code to maintain and debug

## 🧪 **Testing Checklist**

### Pre-Deployment
- [ ] Verify Sanity Studio loads at `/studio`
- [ ] Confirm authorized members can login to Studio
- [ ] Test `/admin` redirects to `/login` when not authenticated
- [ ] Run `npm run validate:startup`

### Post-Deployment
- [ ] Test complete authentication flow
- [ ] Verify `/admin` is protected
- [ ] Confirm authorized members can access admin
- [ ] Test logout functionality
- [ ] Verify unauthorized users are blocked

## 🔄 **User Experience**

### **For Authorized Members**
1. Visit `/admin`
2. Click "Login with Sanity Studio"
3. Authenticate with Google (if not already logged in)
4. Automatically redirected back to admin dashboard

### **For Unauthorized Users**
1. Visit `/admin`
2. Redirected to login page
3. Can access `/studio` but won't be able to authenticate
4. Cannot access admin dashboard

## 📞 **Support & Troubleshooting**

### **Common Issues**

#### "Can't access /admin"
- Ensure you're logged into Sanity Studio first
- Check that your Google account is added to Sanity workspace
- Clear browser cookies and try again

#### "Studio not loading"
- Check `/api/studio/health` endpoint
- Verify Sanity environment variables
- Check browser console for errors

#### "Authentication not working"
- Verify you're using an authorized Google account
- Check that you're a member of the Sanity workspace
- Try logging out and back into Sanity Studio

### **Debug Tools**
- `/test-auth` - Authentication status page
- `/api/studio/health` - Studio configuration check
- Browser developer tools - Check cookies and network requests

## 🎯 **Next Steps**

1. **Deploy the simplified code**
2. **Test the authentication flow**
3. **Verify both authorized members can access**
4. **Document the process for future team members**

---

**Status**: ✅ Simple Sanity Studio Authentication - Ready for Production

**No additional setup required!** Just deploy and test.