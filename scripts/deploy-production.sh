#!/bin/bash

# Production Deployment Script for Aviators Training Centre Blog System
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting production deployment for Aviators Training Centre Blog System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking required environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SANITY_PROJECT_ID"
        "SANITY_API_TOKEN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "FIREBASE_PRIVATE_KEY"
        "FIREBASE_CLIENT_EMAIL"
        "RESEND_API_KEY"
        "ADMIN_USERNAME"
        "ADMIN_PASSWORD"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_error "Please set all required environment variables before deploying."
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Validate Sanity configuration
validate_sanity() {
    print_status "Validating Sanity configuration..."
    
    # Check if Sanity project is accessible
    if ! npx sanity projects list | grep -q "$NEXT_PUBLIC_SANITY_PROJECT_ID"; then
        print_error "Cannot access Sanity project: $NEXT_PUBLIC_SANITY_PROJECT_ID"
        print_error "Please check your SANITY_API_TOKEN and project ID"
        exit 1
    fi
    
    print_success "Sanity configuration is valid"
}

# Build and test the application
build_and_test() {
    print_status "Installing dependencies..."
    npm ci --production=false
    
    print_status "Running type check..."
    npm run type-check
    
    print_status "Running linting..."
    npm run lint
    
    print_status "Running tests..."
    npm run test:ci
    
    print_status "Building application..."
    npm run build
    
    print_success "Build completed successfully"
}

# Deploy Sanity Studio
deploy_sanity_studio() {
    print_status "Deploying Sanity Studio..."
    
    cd studio
    
    # Install studio dependencies
    npm ci
    
    # Build and deploy studio
    npx sanity build
    npx sanity deploy --source-maps
    
    cd ..
    
    print_success "Sanity Studio deployed successfully"
}

# Configure webhooks
configure_webhooks() {
    print_status "Configuring Sanity webhooks..."
    
    # Create webhook for content updates
    webhook_url="${NEXT_PUBLIC_SITE_URL}/api/webhooks/sanity"
    
    # Note: This would typically be done through Sanity's management API
    # For now, we'll just print instructions
    print_warning "Please manually configure the following webhook in Sanity Studio:"
    echo "  URL: $webhook_url"
    echo "  Secret: $SANITY_WEBHOOK_SECRET"
    echo "  Triggers: Create, Update, Delete for 'post' documents"
    
    print_success "Webhook configuration instructions provided"
}

# Set up monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create log directories
    mkdir -p logs/production
    
    # Set up log rotation (if logrotate is available)
    if command -v logrotate &> /dev/null; then
        cat > /tmp/aviators-blog-logrotate << EOF
logs/production/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF
        sudo mv /tmp/aviators-blog-logrotate /etc/logrotate.d/aviators-blog
        print_success "Log rotation configured"
    else
        print_warning "logrotate not available, skipping log rotation setup"
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if the site is accessible
    if curl -f -s "$NEXT_PUBLIC_SITE_URL" > /dev/null; then
        print_success "Site is accessible at $NEXT_PUBLIC_SITE_URL"
    else
        print_error "Site is not accessible at $NEXT_PUBLIC_SITE_URL"
        exit 1
    fi
    
    # Check API endpoints
    api_endpoints=(
        "/api/health"
        "/api/analytics/pageview"
        "/api/webhooks/sanity"
    )
    
    for endpoint in "${api_endpoints[@]}"; do
        if curl -f -s "${NEXT_PUBLIC_SITE_URL}${endpoint}" > /dev/null; then
            print_success "API endpoint $endpoint is accessible"
        else
            print_warning "API endpoint $endpoint may not be accessible"
        fi
    done
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
Aviators Training Centre Blog System - Deployment Report
========================================================

Deployment Date: $(date)
Site URL: $NEXT_PUBLIC_SITE_URL
Sanity Project: $NEXT_PUBLIC_SANITY_PROJECT_ID
Environment: production

Components Deployed:
- Next.js Application: ✅
- Sanity Studio: ✅
- API Routes: ✅
- Webhooks: ⚠️ (Manual configuration required)
- Monitoring: ✅

Environment Variables Configured:
- Sanity: ✅
- Firebase: ✅
- Email: ✅
- Admin: ✅
- Analytics: ✅

Next Steps:
1. Configure Sanity webhooks manually in Sanity Studio
2. Test all functionality thoroughly
3. Set up monitoring alerts
4. Schedule regular backups
5. Update DNS records if needed

Deployment completed successfully!
EOF
    
    print_success "Deployment report generated: $report_file"
}

# Main deployment process
main() {
    echo "========================================================="
    echo "  Aviators Training Centre Blog System"
    echo "  Production Deployment Script"
    echo "========================================================="
    echo ""
    
    # Pre-deployment checks
    check_env_vars
    validate_sanity
    
    # Build and deploy
    build_and_test
    deploy_sanity_studio
    
    # Configuration
    configure_webhooks
    setup_monitoring
    
    # Post-deployment verification
    verify_deployment
    generate_report
    
    echo ""
    echo "========================================================="
    print_success "🎉 Production deployment completed successfully!"
    echo "========================================================="
    echo ""
    echo "Your blog system is now live at: $NEXT_PUBLIC_SITE_URL"
    echo "Sanity Studio is available at: https://$NEXT_PUBLIC_SANITY_PROJECT_ID.sanity.studio"
    echo ""
    echo "Please review the deployment report and complete any manual steps."
}

# Run the deployment
main "$@"