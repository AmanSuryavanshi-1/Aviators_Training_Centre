# Aviators Training Centre - Blog Management Studio

A production-ready Sanity Studio for managing the Aviators Training Centre blog system with advanced features including workflow management, SEO optimization, intelligent CTA routing, and comprehensive content management.

## 🚀 Features

### Content Management
- **Enhanced Blog Editor**: Rich text editing with aviation-specific content types
- **Workflow Management**: Draft → Review → Approved → Published workflow
- **Category Management**: Organized content categorization with intelligent routing
- **Author Management**: Multi-author support with role-based permissions
- **Course Integration**: Seamless integration with course catalog for CTA routing

### SEO & Performance
- **Advanced SEO Tools**: Real-time SEO analysis and optimization suggestions
- **Structured Data**: Automatic schema markup for educational content
- **Meta Tag Management**: Dynamic Open Graph and Twitter Card generation
- **Performance Tracking**: Content performance metrics and analytics

### Media Management
- **Enhanced Media Library**: Organized media management with guidelines
- **Image Optimization**: Automatic image optimization and format conversion
- **Alt Text Validation**: Required alt text for accessibility compliance
- **Upload Guidelines**: Built-in guidelines for optimal image formats and sizes

### Production Features
- **User Permissions**: Role-based access control (Admin, Editor, Author, Contributor)
- **Content Preview**: Live preview functionality for draft content
- **Scheduled Publishing**: Schedule posts for future publication
- **Content Validation**: Comprehensive validation before publishing
- **Health Monitoring**: Built-in health checks and monitoring

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sanity CLI (`npm install -g @sanity/cli`)

### Initial Setup

1. **Clone and Install Dependencies**
   ```bash
   cd studio-aviator-training-centre-(atc)
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Studio**
   - Development: http://localhost:3333
   - Production: https://aviators-training-centre-blog.sanity.studio

### Environment Variables

```env
# Required
SANITY_STUDIO_PROJECT_ID=3u4fa9kl
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2024-01-01

# Preview Configuration
SANITY_STUDIO_PREVIEW_URL=http://localhost:3000
SANITY_STUDIO_PREVIEW_SECRET=your-preview-secret-key

# Production URLs
SANITY_STUDIO_PRODUCTION_URL=https://www.aviatorstrainingcentre.in
SANITY_STUDIO_STAGING_URL=https://staging.aviatorstrainingcentre.com

# Media Configuration
SANITY_STUDIO_MEDIA_MAX_SIZE=10485760
SANITY_STUDIO_MEDIA_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/gif

# User Management
SANITY_STUDIO_ADMIN_EMAIL=admin@aviatorstrainingcentre.com
```

## 📚 Content Management Guide

### Creating Blog Posts

1. **Navigate to Blog Posts** → **Create New Blog Post**
2. **Fill Required Fields**:
   - Title (10-80 characters)
   - Slug (auto-generated from title)
   - Excerpt (120-160 characters)
   - Featured Image (1200x630px recommended)
   - Category
   - Content

3. **SEO Optimization**:
   - SEO Title (max 60 characters)
   - Meta Description (120-160 characters)
   - Focus Keyword
   - Structured Data Configuration

4. **CTA Configuration**:
   - Strategic CTA Placements
   - Intelligent Course Routing
   - Conversion Tracking Setup

### Workflow Management

#### Workflow States
- **📝 Draft**: Content being written
- **👀 Under Review**: Content submitted for review
- **✅ Approved**: Content approved for publishing
- **🌐 Published**: Content live on website
- **📦 Archived**: Content no longer active

#### Role Permissions
- **Admin**: Full access to all features
- **Editor**: Content management and publishing
- **Author**: Create and edit own content
- **Contributor**: Create draft content only

### Media Management

#### Image Guidelines
- **Featured Images**: 1200x630px (16:9 ratio)
- **Content Images**: Max 1920px width
- **File Formats**: WebP preferred, JPEG/PNG acceptable
- **File Size**: Under 500KB for featured, 1MB for content
- **Alt Text**: Required for all images

#### Upload Process
1. Navigate to Media Library
2. Drag and drop or click to upload
3. Add alt text and captions
4. Organize with tags and categories

## 🔧 Development & Deployment

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run start           # Start production server

# Building & Deployment
npm run build           # Build for production
npm run deploy          # Deploy to Sanity
npm run deploy-production # Full production deployment

# Maintenance
npm run validate-schema # Validate schema configuration
npm run check-health    # Run health checks
npm run setup-sample-data # Setup sample content
```

### Production Deployment

1. **Prepare Environment**
   ```bash
   # Set production environment variables
   export SANITY_STUDIO_PROJECT_ID=3u4fa9kl
   export SANITY_STUDIO_DATASET=production
   ```

2. **Deploy to Production**
   ```bash
   npm run deploy-production
   ```

3. **Verify Deployment**
   ```bash
   npm run check-health
   ```

### Health Monitoring

The studio includes comprehensive health monitoring:

```bash
# Run health check
npm run check-health

# Check specific areas
- Connection to Sanity
- Schema type validation
- Content integrity
- SEO health
- Workflow status
```

## 🎯 SEO Optimization

### Built-in SEO Features
- **Real-time SEO Analysis**: Live scoring and suggestions
- **Meta Tag Generation**: Automatic Open Graph and Twitter Cards
- **Structured Data**: Schema.org markup for educational content
- **Keyword Optimization**: Focus keyword analysis and suggestions
- **Content Analysis**: Readability and structure recommendations

### SEO Checklist
- ✅ Title optimization (30-60 characters)
- ✅ Meta description (120-160 characters)
- ✅ Focus keyword integration
- ✅ Header structure (H2, H3, H4)
- ✅ Image alt text
- ✅ Internal linking
- ✅ Content length (minimum 300 words)

## 🔗 Intelligent CTA System

### CTA Types
- **Course Promotion**: Direct course enrollment
- **Free Consultation**: Lead generation
- **Newsletter Signup**: Email list building
- **Resource Download**: Content marketing

### Intelligent Routing
The system automatically routes CTAs based on:
- Blog content analysis
- Category mapping
- Keyword detection
- User behavior patterns

### Course Mapping
- **Technical General** → DGCA Ground School
- **Technical Specific** → Aircraft Systems Training
- **Career Guidance** → CPL Ground School
- **Advanced Training** → ATPL Ground School
- **Type Rating** → Specific Aircraft Training

## 🔐 Security & Permissions

### User Roles
1. **Administrator**
   - Full system access
   - User management
   - System configuration

2. **Editor**
   - Content management
   - Publishing rights
   - SEO tools access

3. **Author**
   - Create/edit own content
   - Submit for review
   - Media upload

4. **Contributor**
   - Create draft content
   - Limited media access
   - No publishing rights

### Security Features
- Role-based access control
- Document-level permissions
- Secure media uploads
- Audit logging
- CORS configuration

## 📊 Analytics & Reporting

### Content Analytics
- Post performance metrics
- SEO health scores
- Workflow status tracking
- Media usage statistics

### Health Reports
- System health monitoring
- Content integrity checks
- SEO compliance validation
- Performance optimization suggestions

## 🆘 Troubleshooting

### Common Issues

1. **Connection Problems**
   ```bash
   # Check environment variables
   echo $SANITY_STUDIO_PROJECT_ID
   
   # Verify credentials
   sanity login
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules
   npm install
   npm run build
   ```

3. **Schema Validation Errors**
   ```bash
   # Validate schema
   npm run validate-schema
   
   # Check for syntax errors in schema files
   ```

4. **Permission Issues**
   ```bash
   # Check user role configuration
   # Verify email in permissions.ts
   ```

### Getting Help

- **Documentation**: Check inline documentation in schema files
- **Health Check**: Run `npm run check-health` for diagnostics
- **Logs**: Check browser console for detailed error messages
- **Support**: Contact the development team

## 🚀 Next Steps

### Planned Enhancements
- [ ] Advanced analytics dashboard
- [ ] A/B testing for CTAs
- [ ] Automated content optimization
- [ ] Multi-language support
- [ ] Advanced workflow automation
- [ ] Integration with external analytics

### Contributing
1. Follow the established schema patterns
2. Add proper TypeScript types
3. Include validation rules
4. Update documentation
5. Test thoroughly before deployment

---

## 📞 Support

For technical support or questions about the blog management system:

- **Email**: tech@aviatorstrainingcentre.com
- **Documentation**: Check this README and inline comments
- **Health Check**: Use `npm run check-health` for diagnostics

---

*Last Updated: January 2024*
*Version: 1.0.0*