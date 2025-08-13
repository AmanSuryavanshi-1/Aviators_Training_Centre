#!/bin/bash

# Script to update website integration after n8n deployment

echo "🌐 Updating Website Integration"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Configuration
NEW_N8N_URL="https://n8n.aviatorstrainingcentre.in"
WEBHOOK_PATH="/webhook/firebase-webhook"
CALCOM_WEBHOOK_PATH="/webhook/64c3f715-d3f3-4273-8051-8d32fab07d26"

print_header "Step 1: Update Contact Form API"

echo "📝 Update src/app/api/contact/route.ts:"
echo "======================================"
echo
echo "Replace the webhook URL:"
echo "OLD: const response = await fetch('https://your-old-url/webhook/firebase-webhook',"
echo "NEW: const response = await fetch('${NEW_N8N_URL}${WEBHOOK_PATH}',"
echo
echo "Complete code snippet:"
echo "----------------------"
cat << 'EOF'
const response = await fetch('https://n8n.aviatorstrainingcentre.in/webhook/firebase-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer atc_webhook_secure_token_2024_n8n_firebase_integration'
  },
  body: JSON.stringify(contactData)
});
EOF

print_header "Step 2: Update Cal.com Webhook"

echo "📅 Update Cal.com Dashboard:"
echo "============================"
echo
echo "1. Go to Cal.com Dashboard"
echo "2. Navigate to Settings → Webhooks"
echo "3. Find existing webhook or create new one"
echo "4. Update URL:"
echo "   OLD: https://your-old-url/webhook/64c3f715-d3f3-4273-8051-8d32fab07d26"
echo "   NEW: ${NEW_N8N_URL}${CALCOM_WEBHOOK_PATH}"
echo
echo "5. Ensure these events are selected:"
echo "   ✅ BOOKING_CREATED"
echo "   ✅ BOOKING_CANCELLED"
echo "   ✅ BOOKING_RESCHEDULED"

print_header "Step 3: Test Integration"

echo "🧪 Testing Commands:"
echo "==================="
echo
echo "1. Test Firebase Webhook:"
echo "curl -X POST ${NEW_N8N_URL}${WEBHOOK_PATH} \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer atc_webhook_secure_token_2024_n8n_firebase_integration' \\"
echo "  -d '{"
echo "    \"name\": \"Test User\","
echo "    \"email\": \"test@example.com\","
echo "    \"phone\": \"+1234567890\","
echo "    \"subject\": \"Test Subject\","
echo "    \"message\": \"Test message\""
echo "  }'"
echo
echo "2. Test website contact form"
echo "3. Test Cal.com booking"
echo "4. Check Airtable for new records"
echo "5. Check email delivery"

print_header "Step 4: Environment Variables"

echo "🔧 Update Environment Variables (if any):"
echo "========================================="
echo
echo "If your website uses environment variables for webhook URLs:"
echo "NEXT_PUBLIC_N8N_WEBHOOK_URL=${NEW_N8N_URL}${WEBHOOK_PATH}"
echo "N8N_WEBHOOK_URL=${NEW_N8N_URL}${WEBHOOK_PATH}"

print_header "Step 5: Deploy Website Changes"

echo "🚀 Deploy Updated Website:"
echo "=========================="
echo
echo "1. Commit changes to git:"
echo "   git add src/app/api/contact/route.ts"
echo "   git commit -m 'Update n8n webhook URL to production server'"
echo "   git push origin main"
echo
echo "2. Deploy to Vercel (if using Vercel):"
echo "   - Changes will auto-deploy from GitHub"
echo "   - Or manually: vercel --prod"
echo
echo "3. Test production website"

print_header "Step 6: Monitoring"

echo "📊 Monitor Integration:"
echo "======================"
echo
echo "1. Check n8n execution logs:"
echo "   docker-compose logs -f n8n"
echo
echo "2. Monitor webhook calls:"
echo "   tail -f /var/log/n8n-monitoring.log"
echo
echo "3. Check Airtable for new records"
echo "4. Verify email delivery"

print_status "Website integration update guide complete!"
echo
echo "🎯 Summary:"
echo "==========="
echo "✅ Update contact form webhook URL"
echo "✅ Update Cal.com webhook URL"
echo "✅ Test all integrations"
echo "✅ Deploy website changes"
echo "✅ Monitor for 24 hours"
echo
echo "🌐 New n8n URL: ${NEW_N8N_URL}"
echo "📧 Support: Check logs if issues occur"