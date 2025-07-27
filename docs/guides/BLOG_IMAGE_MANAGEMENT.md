# Blog Image Management Guide

This guide explains how to manage images for your blog posts using the new Sanity-integrated image system.

## 🎯 Overview

The blog system now supports three ways to add images to your posts:

1. **Upload new images** directly to Sanity
2. **Browse existing Sanity images** from your media library
3. **Use local images** (automatically uploaded to Sanity)

## 🚀 Quick Start

### Step 1: Access the Image Manager

1. Go to `/admin/new` to create a new blog post
2. Click on the **"Media"** tab
3. You'll see the image management interface

### Step 2: Choose Your Image Method

#### Option A: Upload New Image
- Click **"Choose File"** in the upload section
- Select an image from your computer (max 5MB)
- The image will be uploaded to Sanity automatically
- Add alt text for accessibility

#### Option B: Browse Sanity Library
- Scroll to the **"Sanity Image Library"** section
- Browse through your uploaded images
- Click on any image to select it
- The system uses the Sanity asset ID for proper referencing

#### Option C: Use Local Images (Legacy)
- Scroll to the **"Local Gallery"** section
- Click on any preset image
- The image will be uploaded to Sanity when you publish the post

## 📋 Detailed Instructions

### Uploading Images to Sanity

1. **Prepare Your Images:**
   - Supported formats: JPG, PNG, WebP, GIF
   - Maximum file size: 5MB
   - Recommended dimensions: 1200x630px for featured images

2. **Upload Process:**
   - Click "Choose File" in the upload section
   - Select your image file
   - Wait for the upload to complete
   - The image will appear in your Sanity media library

3. **Add Alt Text:**
   - Always add descriptive alt text for accessibility
   - Example: "Pilot training cockpit with instruments visible"

### Managing Existing Images

1. **Browse Your Library:**
   - The Sanity Image Browser shows all uploaded images
   - Use the search box to find specific images
   - Images show filename, size, and upload date

2. **Select Images:**
   - Click on any image to select it
   - Selected images show a green checkmark
   - The image reference is automatically handled

3. **Refresh Library:**
   - Click "Refresh Images" to see newly uploaded images
   - The library updates automatically after uploads

## 🔧 Troubleshooting

### Common Issues

#### "Failed to upload image"
**Cause:** File too large, wrong format, or permission issues

**Solutions:**
1. Check file size (must be < 5MB)
2. Ensure file is an image format (JPG, PNG, WebP, GIF)
3. Verify your Sanity API token has Editor permissions
4. Try refreshing the page and uploading again

#### "Failed to load images from Sanity"
**Cause:** Connection or permission issues

**Solutions:**
1. Check your internet connection
2. Verify Sanity API token is valid
3. Click "Try Again" to reload
4. Check browser console for detailed errors

#### "Reference is not a valid document ID"
**Cause:** Using local file paths instead of Sanity references

**Solutions:**
1. Use the new image uploader instead of local paths
2. Upload local images to Sanity first
3. Select images from the Sanity Image Browser

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Image size must be less than 5MB" | File too large | Compress image or use smaller file |
| "Please select an image file" | Wrong file type | Use JPG, PNG, WebP, or GIF |
| "Sanity API token lacks upload permissions" | Token permissions | Create new token with Editor permissions |
| "Failed to process image upload" | Server error | Try again or contact support |

## 🎨 Best Practices

### Image Optimization

1. **Size Guidelines:**
   - Featured images: 1200x630px (16:9 ratio)
   - In-content images: 800x450px maximum
   - Thumbnails: 400x225px

2. **File Formats:**
   - Use WebP for best compression
   - PNG for images with transparency
   - JPG for photographs
   - Avoid GIF unless animation is needed

3. **File Naming:**
   - Use descriptive names: `pilot-training-cockpit.webp`
   - Avoid spaces and special characters
   - Include relevant keywords

### SEO and Accessibility

1. **Alt Text:**
   - Be descriptive and specific
   - Include relevant keywords naturally
   - Keep under 125 characters
   - Don't start with "Image of" or "Picture of"

2. **File Names:**
   - Use SEO-friendly names
   - Include target keywords
   - Use hyphens instead of underscores

## 🔄 Migration from Local Images

If you have existing blog posts with local images (`/Blogs/image.webp`), follow these steps:

### Step 1: Upload Local Images to Sanity

Run the upload script to move all local images to Sanity:

```bash
npm run upload:images
```

This will:
- Upload all images from `public/Blogs/` to Sanity
- Create a mapping file (`sanity-image-mapping.json`)
- Show you the new Sanity asset IDs

### Step 2: Update Existing Posts

1. Open each blog post in the admin editor
2. Go to the Media tab
3. Select the corresponding image from the Sanity library
4. Save the post

### Step 3: Verify Migration

1. Check that images display correctly on the blog
2. Verify image URLs use Sanity CDN
3. Test image loading and responsiveness

## 📊 Image Analytics

### Tracking Image Performance

The system automatically tracks:
- Image load times
- CDN delivery performance
- Image optimization metrics
- User engagement with images

### Optimization Recommendations

Based on analytics, the system may suggest:
- Compressing large images
- Converting to WebP format
- Updating alt text for better SEO
- Replacing low-performing images

## 🛠️ Advanced Features

### Bulk Image Operations

1. **Bulk Upload:**
   - Select multiple files in the upload dialog
   - Images are uploaded sequentially
   - Progress is shown for each upload

2. **Batch Processing:**
   - Use the Sanity Studio for advanced operations
   - Bulk edit alt text and metadata
   - Organize images into collections

### Image Transformations

Sanity automatically provides:
- Responsive image sizing
- Format conversion (WebP, AVIF)
- Quality optimization
- CDN delivery

### API Integration

For developers, images are accessible via:
- Sanity Image URLs with transformations
- Asset IDs for programmatic access
- Metadata and analytics APIs

## 📞 Support

### Getting Help

1. **Check the troubleshooting section** above
2. **Run diagnostics:**
   ```bash
   npm run validate:sanity
   ```
3. **Check browser console** for detailed error messages
4. **Contact support** with specific error messages

### Useful Commands

```bash
# Validate Sanity environment
npm run validate:sanity

# Upload local images to Sanity
npm run upload:images

# Test image upload functionality
npm run test:images
```

### Resources

- [Sanity Image Documentation](https://www.sanity.io/docs/image-type)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Accessibility Guidelines](https://www.w3.org/WAI/tutorials/images/)

---

**Last Updated:** [Current Date]
**Version:** 2.0
**Maintainer:** Development Team