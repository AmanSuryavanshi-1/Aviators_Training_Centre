# Sanity API Token Permissions Fix

## 🚨 **Issue Identified**
Your Sanity API token has "editor access" but is missing the **"update"** permission required for deletion operations.

## 🔧 **Solution: Update Token Permissions**

### **Option 1: Create New Token with Full Permissions (Recommended)**

1. **Go to Sanity Management Console**:
   - Visit: https://sanity.io/manage/personal/tokens
   - Or go to your project dashboard → API → Tokens

2. **Create New Token**:
   - Click "Add API token"
   - Name: `Blog Deletion Token` or similar
   - Permissions: Select **"Editor"** or **"Administrator"**
   - Dataset: `production` (or your dataset name)

3. **Copy the New Token**:
   - Copy the generated token immediately (you won't see it again)

4. **Update Environment Variable**:
   ```env
   # Replace the current token in .env.local
   SANITY_API_TOKEN=your_new_token_here
   ```

### **Option 2: Update Existing Token Permissions**

1. **Find Your Current Token**:
   - Go to https://sanity.io/manage/personal/tokens
   - Find the token you're currently using

2. **Check Token Permissions**:
   - Click on the token to view details
   - Ensure it has these permissions:
     - ✅ **Read** (query documents)
     - ✅ **Create** (create new documents)  
     - ✅ **Update** (modify existing documents) ← **This is required for deletion!**
     - ✅ **Delete** (remove documents)

3. **Update Permissions if Needed**:
   - If missing permissions, you may need to create a new token
   - Sanity doesn't always allow editing existing token permissions

### **Option 3: Use Project-Level Token**

1. **Go to Project Settings**:
   - Visit your Sanity project dashboard
   - Go to Settings → API → Tokens

2. **Create Project Token**:
   - Click "Add API token"
   - Select **"Editor"** or **"Administrator"** role
   - This ensures full permissions for the project

## 🧪 **Test Your Token**

After updating your token, test it using our diagnostic endpoint:

```bash
# Test the new token permissions
curl http://localhost:3000/api/sanity/test-permissions
```

Or visit: http://localhost:3000/api/sanity/test-permissions

## 📋 **Required Permissions for Blog Deletion**

Your token needs these specific permissions:

| Permission | Required | Purpose |
|------------|----------|---------|
| **Read** | ✅ Yes | Query and validate posts before deletion |
| **Create** | ✅ Yes | Create audit logs and test documents |
| **Update** | ✅ **CRITICAL** | Required for deletion operations |
| **Delete** | ✅ Yes | Actually remove documents |

## 🔒 **Security Best Practices**

1. **Use Environment Variables**: Never commit tokens to code
2. **Limit Scope**: Use dataset-specific tokens when possible
3. **Regular Rotation**: Update tokens periodically
4. **Monitor Usage**: Check token usage in Sanity dashboard

## 🚀 **After Fixing**

Once you've updated your token:

1. **Restart Development Server**: 
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Test Deletion**: Try deleting a blog post again

3. **Verify Logs**: Check that you see "✅ Successfully deleted document" in logs

## 🆘 **Still Having Issues?**

If you continue to have permission issues:

1. **Double-check the token** in your `.env.local` file
2. **Verify the dataset name** matches your Sanity project
3. **Check project ID** is correct
4. **Try creating a completely new token** with Administrator role

## 📞 **Need Help?**

The error logs show:
```
Insufficient permissions; permission "update" required
```

This confirms the token lacks the **update** permission needed for deletions.

---

**Next Steps**: Update your Sanity API token with the required permissions and restart your development server.