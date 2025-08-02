# Production Deployment Guide

This guide covers deploying the Aviators Training Centre application with Sanity Studio integration to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Configuration](#build-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Health Checks](#health-checks)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services

- **Sanity Project**: Set up with production dataset
- **Domain**: Configured with SSL certificate
- **Deployment Platform**: Vercel, Netlify, or Docker-compatible hosting

### Required Permissions

- Sanity project admin access
- Domain DNS management
- Deployment platform access

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.production.template .env.production
```

### Step 2: Configure Required Variables

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_EXPIRES_IN=1h

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### Step 3: Configure Optional Variables

```bash
# Monitoring and Alerting
LOGGING_ENABLED=true
ALERTING_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_EMAIL_RECIPIENTS=admin@yourdomain.com
```

### Environment Variable Validation

Run the validation script to ensure all required variables are set:

```bash
npm run validate:env
```

## Build Configuration

### Production Next.js Configuration

The application uses `next.config.production.js` for production builds with:

- **Security Headers**: CSP, X-Frame-Options, etc.
- **Image Optimization**: WebP/AVIF support
- **Bundle Analysis**: Optional with `ANALYZE=true`
- **Studio Integration**: Proper routing and CSP for Sanity Studio

### Build Commands

```bash
# Standard build
npm run build

# Build with bundle analysis
ANALYZE=true npm run build

# Production build with validation
npm run build:production
```

## Deployment Platforms

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production.template`

3. **Custom Build Command**
   ```json
   {
     "buildCommand": "npm run build:production",
     "outputDirectory": ".next"
   }
   ```

4. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure DNS records as instructed

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t aviators-training-centre .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id \
     -e SANITY_API_TOKEN=your_token \
     -e JWT_SECRET=your_secret \
     aviators-training-centre
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.production
       restart: unless-stopped
   ```

### Netlify Deployment

1. **Build Settings**
   - Build command: `npm run build:production`
   - Publish directory: `.next`

2. **Environment Variables**
   - Configure in Netlify dashboard under Site Settings → Environment Variables

3. **Redirects Configuration**
   ```toml
   # netlify.toml
   [[redirects]]
     from = "/studio/*"
     to = "/studio/:splat"
     status = 200
   
   [[redirects]]
     from = "/admin/*"
     to = "/admin/:splat"
     status = 200
   ```

## Health Checks

### Available Endpoints

- **General Health**: `GET /api/health`
- **Studio Health**: `GET /api/health/studio`
- **Simple Check**: `HEAD /api/health` (for load balancers)

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "checks": [
    {
      "name": "sanity_connection",
      "status": "healthy",
      "responseTime": 150
    }
  ],
  "summary": {
    "total": 6,
    "healthy": 6,
    "unhealthy": 0,
    "degraded": 0
  }
}
```

### Monitoring Integration

Configure your monitoring service to check:
- `GET /api/health` every 30 seconds
- Alert on non-200 responses
- Alert on response time > 5 seconds

## Monitoring and Alerting

### Logging Configuration

```bash
# Enable structured logging
LOGGING_ENABLED=true
LOGGING_ENDPOINT=https://your-logging-service.com/api/logs
LOGGING_API_KEY=your_api_key
```

### Slack Alerts

```bash
# Configure Slack notifications
SLACK_ALERTS_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_ALERT_CHANNEL=#alerts
```

### Email Alerts

```bash
# Configure email notifications
EMAIL_ALERTS_ENABLED=true
ALERT_EMAIL_RECIPIENTS=admin@yourdomain.com,devops@yourdomain.com
```

### Alert Thresholds

```bash
# Configure alert thresholds
AUTH_FAILURE_THRESHOLD_PER_MINUTE=10
AUTH_FAILURE_THRESHOLD_PER_HOUR=100
ERROR_RATE_THRESHOLD_PERCENTAGE=5
RESPONSE_TIME_THRESHOLD_MS=5000
```

## Security Considerations

### HTTPS Configuration

- **Required**: All production deployments must use HTTPS
- **HSTS**: Enabled via security headers
- **Certificate**: Use Let's Encrypt or platform-provided certificates

### Content Security Policy

The application includes strict CSP headers:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.sanity.io wss://*.sanity.io;
```

### Authentication Security

- **JWT Secret**: Must be at least 32 characters
- **Session Timeout**: Configurable (default 1 hour)
- **Member Validation**: Real-time validation against Sanity project members
- **Rate Limiting**: Configurable thresholds for authentication attempts

### Environment Security

```bash
# Ensure debug flags are disabled
DEBUG=false
VERBOSE_LOGGING=false
ENABLE_SOURCE_MAPS=false
```

## Deployment Checklist

### Pre-Deployment

- [ ] All required environment variables configured
- [ ] Sanity project configured with production dataset
- [ ] Domain and SSL certificate configured
- [ ] Build passes locally with production configuration
- [ ] All tests pass
- [ ] Security scan completed

### Deployment

- [ ] Deploy to staging environment first
- [ ] Run deployment validation tests
- [ ] Verify health checks pass
- [ ] Test authentication flow
- [ ] Test Studio integration
- [ ] Verify monitoring and alerting

### Post-Deployment

- [ ] Monitor application logs
- [ ] Verify all health checks are green
- [ ] Test critical user journeys
- [ ] Monitor performance metrics
- [ ] Verify backup systems are working

## Troubleshooting

### Common Issues

#### 1. Sanity Connection Errors

**Symptoms**: Health checks fail, Studio doesn't load
**Solutions**:
- Verify `SANITY_API_TOKEN` has correct permissions
- Check `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- Ensure Sanity project is accessible

#### 2. Authentication Issues

**Symptoms**: Login fails, JWT errors
**Solutions**:
- Verify `JWT_SECRET` is at least 32 characters
- Check member validation against Sanity project members
- Verify session timeout configuration

#### 3. Studio Navigation Errors

**Symptoms**: Studio links don't work, navigation fails
**Solutions**:
- Verify `NEXT_PUBLIC_SITE_URL` is correctly set
- Check CSP headers allow Studio resources
- Ensure Studio route is properly configured

#### 4. Build Failures

**Symptoms**: Deployment fails during build
**Solutions**:
- Run `npm run build:production` locally
- Check for TypeScript errors
- Verify all dependencies are installed
- Check for environment variable issues

### Debug Commands

```bash
# Check environment configuration
npm run validate:env

# Run health checks locally
curl http://localhost:3000/api/health

# Test Studio health
curl http://localhost:3000/api/health/studio

# Run deployment validation tests
npm run test:deployment

# Check build configuration
npm run build -- --debug
```

### Log Analysis

Monitor these log patterns:

```bash
# Authentication errors
grep "AUTH_" /var/log/app.log

# Sanity API errors
grep "SANITY_API_ERROR" /var/log/app.log

# Health check failures
grep "health.*unhealthy" /var/log/app.log

# Performance issues
grep "responseTime.*[5-9][0-9][0-9][0-9]" /var/log/app.log
```

## Performance Optimization

### Caching Configuration

```bash
# Configure cache TTL
CACHE_TTL=3600
STATIC_CACHE_TTL=86400
```

### Image Optimization

```bash
# Configure image optimization
IMAGE_OPTIMIZATION_ENABLED=true
IMAGE_QUALITY=80
IMAGE_FORMATS=webp,avif
```

### CDN Configuration

```bash
# Configure CDN (optional)
CDN_URL=https://cdn.yourdomain.com
ASSET_PREFIX=https://cdn.yourdomain.com
```

## Backup and Recovery

### Database Backup

Sanity handles data backup automatically, but consider:
- Regular dataset exports
- Version control for schema changes
- Backup of custom configurations

### Application Backup

- Source code in version control
- Environment variables in secure storage
- Build artifacts and deployment configurations

## Support and Maintenance

### Regular Maintenance Tasks

- Update dependencies monthly
- Rotate JWT secrets quarterly
- Review and update environment variables
- Monitor and analyze performance metrics
- Review security logs and alerts

### Emergency Procedures

1. **Service Outage**
   - Check health endpoints
   - Review recent deployments
   - Check external service status
   - Rollback if necessary

2. **Security Incident**
   - Rotate JWT secrets immediately
   - Review authentication logs
   - Check for unauthorized access
   - Update security configurations

3. **Performance Issues**
   - Check resource usage
   - Review slow query logs
   - Analyze traffic patterns
   - Scale resources if needed

For additional support, contact the development team or refer to the project documentation.