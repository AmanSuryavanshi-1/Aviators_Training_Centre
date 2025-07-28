# API Documentation

This directory contains documentation for all API integrations and endpoints used in the Aviators Training Centre project.

## 📋 Available Documentation

### [Meta Pixel Implementation](./META_PIXEL_IMPLEMENTATION.md)
Complete guide for Facebook/Meta Pixel integration:
- Setup and configuration
- Event tracking implementation
- Conversion tracking
- Privacy compliance

## 🔌 API Categories

### Third-Party Integrations
- **Meta Pixel**: Facebook/Meta advertising and analytics tracking
- **Sanity CMS**: Content management system API
- **Analytics**: Various analytics and tracking services

### Internal APIs
- **Blog API**: Content management and retrieval
- **Lead Generation**: Form submissions and lead tracking
- **Contact Forms**: Contact and inquiry handling

## 🛠️ Implementation Guidelines

When working with APIs:
1. **Security**: Always use environment variables for API keys
2. **Error Handling**: Implement proper error handling and fallbacks
3. **Rate Limiting**: Respect API rate limits and implement backoff strategies
4. **Documentation**: Keep API documentation up to date

## 📊 Monitoring

All API integrations should include:
- Error logging and monitoring
- Performance tracking
- Usage analytics
- Health checks

## 🔒 Security Considerations

- Never commit API keys to version control
- Use HTTPS for all API communications
- Implement proper authentication and authorization
- Follow GDPR and privacy compliance requirements