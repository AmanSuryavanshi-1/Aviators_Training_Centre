# Aviation Tags Auto-Population Guide

This guide explains how to automatically populate aviation-related tags in your Sanity Studio with comprehensive SEO keywords.

## 🏷️ Tags Overview

The script will create 5 aviation-focused tags with comprehensive SEO keywords:

1. **Pilot Jobs** (Green) - Commercial pilot employment opportunities
2. **CPL Employment** (Blue) - CPL license employment prospects  
3. **Aviation Career** (Teal) - Comprehensive aviation career guidance
4. **Airline Hiring** (Orange) - Airline recruitment processes
5. **Pilot Recruitment** (Purple) - Pilot selection and recruitment

Each tag includes 30 carefully researched SEO keywords targeting the Indian aviation market.

## 📋 Prerequisites

Before running the script, ensure you have:

### 1. Environment Variables
Make sure your `.env.local` file contains:

```bash
# Required Sanity variables
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_with_write_permissions
```

### 2. Sanity Token Permissions
Your `SANITY_API_TOKEN` must have **Editor** or **Administrator** permissions:

1. Go to [Sanity Management Console](https://sanity.io/manage)
2. Select your project
3. Go to **API** → **Tokens**
4. Create a new token or verify existing token has write permissions

### 3. Dependencies
Ensure you have the required dependencies installed:
```bash
npm install
```

## 🚀 Running the Script

### Option 1: Using npm script (Recommended)
```bash
npm run tags:populate
```

### Option 2: Direct execution
```bash
tsx tools/scripts/development/populate-aviation-tags.ts
```

### Option 3: Alternative method
```bash
npx tsx tools/scripts/development/populate-aviation-tags.ts
```

## 📊 Script Output

The script provides detailed feedback:

```
=== Aviation Tags Auto-Population Script ===
Project ID: your_project_id
Dataset: production
Has Token: ✅
Tags to create: 5

🔄 Initializing Sanity client...
🔄 Testing Sanity connection...
✅ Read access confirmed
✅ Write access confirmed
🔄 Starting tag creation process...
🔄 Creating tag: Pilot Jobs
✅ Successfully created tag: Pilot Jobs (ID: tag_123)
🔄 Creating tag: CPL Employment
✅ Successfully created tag: CPL Employment (ID: tag_124)
...

=== Results ===
✅ Created: 5 tags
⚠️ Skipped: 0 tags (already exist)
```

## 🔍 Verification

After running the script, verify the tags were created:

### 1. Check Sanity Studio
1. Open your Sanity Studio (usually at `http://localhost:3333`)
2. Navigate to the **Tags** section
3. You should see all 5 aviation tags with their colors and descriptions

### 2. Verify in Code
You can also verify programmatically:
```bash
# Check existing tags
npm run sanity:check
```

## 🏷️ Using the Tags

Once created, you can:

### 1. Assign to Blog Posts
- Edit any blog post in Sanity Studio
- In the tags field, select from the aviation tags
- Tags will appear with their designated colors

### 2. SEO Benefits
- Each tag contains 30 relevant keywords
- Use these keywords in your content strategy
- Tags help with content organization and discoverability

### 3. Content Strategy
Plan content around these tags:
- **Pilot Jobs**: Job market analysis, salary guides, hiring trends
- **CPL Employment**: Post-training career paths, employment statistics
- **Aviation Career**: Career planning, training pathways, success stories
- **Airline Hiring**: Recruitment processes, interview tips, requirements
- **Pilot Recruitment**: Selection criteria, assessment preparation

## ❗ Troubleshooting

### Common Issues

#### 1. "SANITY_API_TOKEN is required"
**Solution**: Add your Sanity API token to `.env.local`:
```bash
SANITY_API_TOKEN=your_actual_token_here
```

#### 2. "Insufficient permissions"
**Solution**: 
- Check your token permissions in Sanity Management Console
- Ensure the token has Editor or Administrator role
- Regenerate the token if needed

#### 3. "Project not found"
**Solution**: Verify your project ID in `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_correct_project_id
```

#### 4. "Tags already exist"
**Solution**: This is normal. The script skips existing tags. If you want to recreate them:
1. Delete existing tags in Sanity Studio
2. Run the script again

### Getting Help

If you encounter issues:

1. **Check Logs**: The script provides detailed error messages
2. **Verify Environment**: Ensure all environment variables are set correctly
3. **Test Connection**: Run `npm run sanity:check` to test basic connectivity
4. **Check Permissions**: Verify your Sanity token has write permissions

## 🔄 Re-running the Script

The script is safe to run multiple times:
- It checks for existing tags before creating
- Skips tags that already exist
- Only creates missing tags

## 📈 Next Steps

After populating the tags:

1. **Content Audit**: Review existing blog posts and assign relevant tags
2. **SEO Strategy**: Use the included keywords for content optimization
3. **Content Planning**: Plan new content around the tag categories
4. **Analytics**: Monitor tag performance in your analytics dashboard

## 🎯 Keywords by Tag

### Pilot Jobs (30 keywords)
Focus on employment opportunities, job market trends, and career prospects.

### CPL Employment (30 keywords)  
Specific to Commercial Pilot License career paths and opportunities.

### Aviation Career (30 keywords)
Broad career guidance and industry opportunities.

### Airline Hiring (30 keywords)
Recruitment processes, hiring trends, and employment in airlines.

### Pilot Recruitment (30 keywords)
Selection processes, recruitment strategies, and talent acquisition.

---

**Note**: All keywords are optimized for the Indian aviation market and align with your training center's focus on commercial pilot education.
