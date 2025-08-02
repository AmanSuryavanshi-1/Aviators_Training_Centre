# 🔧 Sanity CORS Issue - Complete Fix Guide

## 🚨 **Root Cause Identified**

The CORS issue is happening because:

1. **Client-side CORS config doesn't work** - Sanity Studio CORS must be configured on Sanity's servers
2. **Token permissions issue** - Deploy tokens have limited permissions
3. **Environment variable conflicts** - Multiple env files with different configs

## 🛠️ **COMPLETE FIX PROCESS**

### **Step 1: Configure CORS in Sanity Management Console**

1. **Go to Sanity Management Console**:
   - Visit: https://sanity.io/manage
   - Login with your Google account

2. **Select Your Project**:
   - Find "Aviators Training Centre" project
   - Click on it to open project settings

3. **Configure CORS Origins**:
   - Go to **API** tab
   - In **CORS Origins** section, click **Add CORS origin**
   - Add these origins one by one:
     ```
     https://www.aviatorstrainingcentre.in
     https://aviatorstrainingcentre.in
     ```
   - For each origin:
     - ✅ Check "Allow credentials"
     - Click **Save**

4. **Wait for Propagation**:
   - Wait 1-2 minutes for changes to propagate
   - Clear browser cache

### **Step 2: Fix Token Permissions**

1. **Create Proper Studio Token**:
   - In Sanity Management Console
   - Go to **API** tab
   - In **Tokens** section, click **Add API token**
   - Name: "Studio Production Token"
   - Permissions: **Editor** (not Deploy)
   - Copy the token

2. **Update Environment Variables**:
   - Replace the deploy token with the new editor token
   - Update both `.env.local` and `.env.production`

### **Step 3: Clean Environment Configuration**

The current setup has conflicts. Here's the clean configuration:

#### **For Production (.env.production)**:
```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_new_editor_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in

# Other configs...
```

#### **For Local Development (.env.local)**:
```bash
# Same as production but can use localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🧪 **Testing the Fix**

### **Test 1: CORS Check**
Visit: `/api/sanity/cors-check`
- Should show your current request info
- Verify origin matches expected origins

### **Test 2: Studio Access**
1. Visit `/studio`
2. Should NOT show "add CORS origin" message
3. Should show Google login directly
4. After login, should access Studio successfully

### **Test 3: Admin Protection**
1. Visit `/admin`
2. Should redirect to `/login`
3. Use simple login to test
4. Should access admin dashboard

## 🔍 **Debug Information**

### **If CORS Issue Persists**:

1. **Check Sanity Console**:
   - Verify CORS origins are saved
   - Ensure "Allow credentials" is checked
   - Wait 2-3 minutes after changes

2. **Check Browser**:
   - Clear all cookies and cache
   - Try in incognito mode
   - Check browser console for CORS errors

3. **Check Token**:
   - Ensure token has Editor permissions
   - Test token with a simple API call

### **Common Issues**:

- **"Choose login provider"**: CORS not configured properly
- **"Add CORS origin"**: Origins not added to Sanity Console
- **Studio loading error**: Token permissions insufficient
- **Infinite redirect**: Environment variable mismatch

## 🎯 **Expected Behavior After Fix**

1. **Visit `/studio`**:
   - ✅ No CORS error message
   - ✅ Direct Google login screen
   - ✅ Successful Studio access after login

2. **Visit `/admin`**:
   - ✅ Redirects to `/login` when not authenticated
   - ✅ Simple login works for testing
   - ✅ Admin dashboard accessible after login

3. **Authentication Flow**:
   - ✅ Studio login creates proper session cookies
   - ✅ Middleware detects authentication
   - ✅ Seamless navigation between admin and studio

## 🚀 **Action Items**

### **Immediate (Do Now)**:
1. ✅ Configure CORS in Sanity Management Console
2. ✅ Create new Editor token (not Deploy token)
3. ✅ Update environment variables
4. ✅ Clear browser cache and test

### **After Testing**:
1. Remove simple login (temporary testing feature)
2. Clean up debug endpoints
3. Document the working authentication flow

---

**Status**: 🔧 **READY FOR CORS CONFIGURATION**

**Next Step**: Configure CORS origins in Sanity Management Console