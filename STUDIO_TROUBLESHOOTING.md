# 🔧 Sanity Studio Troubleshooting Guide

## 🚨 Current Issue: "useHook is not a function"

This error occurs when React hooks are used incorrectly in Sanity components. I've created an ultra-minimal configuration to fix this.

## ✅ **Solution Applied**

### **What I Did:**
1. **Removed ALL problematic components** from schema types
2. **Created minimal schema** with only essential fields
3. **Removed complex plugins** that might cause hook issues
4. **Simplified document actions** to use defaults only

### **New Minimal Configuration:**
- ✅ Only basic schema types (post, author, category)
- ✅ No custom components that use hooks
- ✅ No complex plugins (media, SEO, etc.)
- ✅ Default document actions (includes delete)

## 🚀 **How to Test the Fix**

### **Step 1: Test Configuration**
```bash
cd studio
node test-studio.js
```
This will verify the config loads without errors.

### **Step 2: Start Studio**
```bash
cd studio
npm run dev-auto
```
This should start without the useHook error.

### **Step 3: Verify Functionality**
1. Studio should load at `http://localhost:3334` (or next available port)
2. You should see: "ATC Studio" as the title
3. You should see: Blog Post, Author, Category in the navigation
4. You should be able to create/edit/delete documents

## 🗑️ **Delete Functionality**

The minimal config uses Sanity's default document actions, which include:
- **Delete button** in the document actions menu (⋯)
- **Duplicate button** for copying documents
- **Publish/Unpublish** for managing document state

### **How to Delete:**
1. Open any document (blog post, author, category)
2. Look for the document actions menu (⋯ or menu button)
3. Click "Delete"
4. Confirm the deletion

## 🔄 **If Still Getting Errors**

### **Clear Browser Cache:**
```bash
# Clear browser cache and reload
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### **Clear Node Modules:**
```bash
cd studio
rm -rf node_modules
npm install
npm run dev-auto
```

### **Check for Port Conflicts:**
```bash
# The dev-auto script will find an available port
# Check console output for the actual port being used
```

## 📋 **What's Available in Minimal Studio**

### **Document Types:**
- **Blog Post**: Title, Slug, Content, Published Date
- **Author**: Name, Slug, Bio
- **Category**: Title, Slug, Description

### **Features:**
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Rich text editor for content
- ✅ Slug generation from titles
- ✅ Date/time fields
- ✅ Reference relationships (when we add them back)

### **Missing (Temporarily Removed):**
- ❌ SEO fields and components
- ❌ Media management plugin
- ❌ Complex preview components
- ❌ Custom document actions
- ❌ Advanced schema validation

## 🔮 **Next Steps (Once Working)**

Once the minimal studio is working, we can gradually add back features:

1. **Add back media plugin** (if no errors)
2. **Add more fields** to existing schemas
3. **Add reference fields** between documents
4. **Add custom validation** rules
5. **Add back SEO fields** (without problematic components)

## 🆘 **Emergency Fallback**

If the minimal config still doesn't work:

### **Option 1: Use Sanity's Default Config**
```bash
cd studio
npx sanity init --template clean
```

### **Option 2: Start Fresh**
```bash
# Backup your data first!
cd studio
npx sanity dataset export production backup.tar.gz
# Then create new studio
npx sanity init
```

## 📞 **Quick Commands**

```bash
# Test configuration
cd studio && node test-studio.js

# Start studio (auto-port)
cd studio && npm run dev-auto

# Start embedded studio
npm run dev
# Then visit: http://localhost:3000/studio

# Clear and reinstall
cd studio && rm -rf node_modules && npm install
```

The minimal configuration should resolve the useHook error and get your studio working with basic functionality!