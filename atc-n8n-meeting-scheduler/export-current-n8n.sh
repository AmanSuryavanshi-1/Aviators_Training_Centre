#!/bin/bash

# Script to export workflows from current n8n instance (cloudflared tunnel)

echo "📤 Exporting Current n8n Workflows"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Create workflows directory if it doesn't exist
mkdir -p workflows

print_header "Step 1: Export Methods"

echo "Choose your export method:"
echo "========================="
echo
echo "Method 1: n8n CLI (if available)"
echo "Method 2: Manual download from web interface"
echo "Method 3: API export (if you have API access)"
echo

read -p "Which method do you prefer? (1/2/3): " method

case $method in
    1)
        print_header "Method 1: n8n CLI Export"
        echo
        print_status "Attempting CLI export..."
        
        # Check if n8n CLI is available
        if command -v n8n &> /dev/null; then
            print_status "n8n CLI found, exporting workflows..."
            
            # Export all workflows
            n8n export:workflow --output=./workflows/ --all
            
            if [ $? -eq 0 ]; then
                print_status "✅ Workflows exported successfully via CLI"
            else
                print_error "❌ CLI export failed, try manual method"
            fi
        else
            print_warning "n8n CLI not found, please use manual method"
        fi
        ;;
        
    2)
        print_header "Method 2: Manual Download"
        echo
        echo "📋 Manual Export Instructions:"
        echo "=============================="
        echo
        echo "1. Open your current n8n instance in browser"
        echo "2. For each workflow, follow these steps:"
        echo
        echo "   📊 ATC_FirebaseDB_1st_Trigger:"
        echo "   - Open the workflow"
        echo "   - Click Settings (gear icon) → Download"
        echo "   - Save as: workflows/ATC_FirebaseDB_1st_Trigger.json"
        echo
        echo "   📊 ATC_CAL.com_2nd_Trigger:"
        echo "   - Open the workflow"
        echo "   - Click Settings (gear icon) → Download"
        echo "   - Save as: workflows/ATC_CAL.com_2nd_Trigger.json"
        echo
        echo "   📊 ATC_Booking_Cancellation:"
        echo "   - Open the workflow"
        echo "   - Click Settings (gear icon) → Download"
        echo "   - Save as: workflows/ATC_Booking_Cancellation.json"
        echo
        echo "3. Verify files are in ./workflows/ directory"
        echo
        read -p "Press Enter when you've completed the manual export..."
        ;;
        
    3)
        print_header "Method 3: API Export"
        echo
        read -p "Enter your n8n instance URL (e.g., https://your-tunnel.trycloudflare.com): " n8n_url
        read -p "Enter your n8n username: " username
        read -s -p "Enter your n8n password: " password
        echo
        
        print_status "Attempting API export..."
        
        # Login and get cookie
        cookie=$(curl -s -c - -X POST "${n8n_url}/rest/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"${username}\",\"password\":\"${password}\"}" | grep -o 'n8n-auth[^;]*')
        
        if [ -n "$cookie" ]; then
            print_status "✅ Authentication successful"
            
            # Get workflows list
            workflows=$(curl -s -H "Cookie: ${cookie}" "${n8n_url}/rest/workflows")
            
            # Extract workflow IDs and export each
            echo "$workflows" | jq -r '.data[] | .id' | while read workflow_id; do
                workflow_name=$(echo "$workflows" | jq -r ".data[] | select(.id==\"$workflow_id\") | .name")
                print_status "Exporting: $workflow_name"
                
                curl -s -H "Cookie: ${cookie}" "${n8n_url}/rest/workflows/${workflow_id}" | \
                    jq '.' > "workflows/${workflow_name}.json"
            done
            
            print_status "✅ API export completed"
        else
            print_error "❌ Authentication failed, please use manual method"
        fi
        ;;
        
    *)
        print_error "Invalid option, please run script again"
        exit 1
        ;;
esac

print_header "Step 2: Verify Export"

echo "🔍 Checking exported files:"
echo "==========================="

required_files=(
    "ATC_FirebaseDB_1st_Trigger.json"
    "ATC_CAL.com_2nd_Trigger.json"
    "ATC_Booking_Cancellation.json"
)

all_found=true

for file in "${required_files[@]}"; do
    if [ -f "workflows/$file" ]; then
        size=$(stat -f%z "workflows/$file" 2>/dev/null || stat -c%s "workflows/$file" 2>/dev/null)
        print_status "✅ $file (${size} bytes)"
    else
        print_error "❌ $file - NOT FOUND"
        all_found=false
    fi
done

if [ "$all_found" = true ]; then
    print_status "🎉 All workflow files exported successfully!"
else
    print_warning "⚠️  Some files are missing. Please complete the export manually."
fi

print_header "Step 3: Backup Current Credentials"

echo "🔐 Credential Backup Instructions:"
echo "=================================="
echo
echo "⚠️  IMPORTANT: Write down these credentials securely!"
echo
echo "From your current n8n instance, note down:"
echo
echo "📊 Airtable Token API:"
echo "- Go to Settings → Credentials"
echo "- Find 'Airtable Personal Access Token account'"
echo "- Note the token (starts with 'pat...')"
echo
echo "📧 Gmail OAuth2:"
echo "- Find 'aviatorstrainingcentre@gmail.com'"
echo "- Note Client ID and Client Secret"
echo
echo "📅 Cal.com API:"
echo "- Find 'Cal.com Adude'"
echo "- Note the API Key"
echo
echo "🔒 HTTP Header Auth:"
echo "- Find 'Header Auth account'"
echo "- Should be: Bearer atc_webhook_secure_token_2024_n8n_firebase_integration"
echo

# Create credentials template
cat > credentials-backup.txt << 'EOF'
# 🔐 n8n Credentials Backup
# ========================
# Fill in these values from your current n8n instance

## Airtable Token API
Name: Airtable Personal Access Token account
Token: [WRITE_YOUR_TOKEN_HERE]

## Gmail OAuth2
Name: aviatorstrainingcentre@gmail.com
Client ID: [WRITE_YOUR_CLIENT_ID_HERE]
Client Secret: [WRITE_YOUR_CLIENT_SECRET_HERE]

## Cal.com API
Name: Cal.com Adude
API Key: [WRITE_YOUR_API_KEY_HERE]

## HTTP Header Auth (Firebase)
Name: Header Auth account
Header Name: Authorization
Header Value: Bearer atc_webhook_secure_token_2024_n8n_firebase_integration

# ⚠️  KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT!
EOF

print_status "📝 Created credentials-backup.txt template"

print_header "Step 4: Export Summary"

echo "📋 Export Summary:"
echo "=================="
echo
echo "✅ Workflow files exported to ./workflows/"
echo "✅ Credentials template created: credentials-backup.txt"
echo
echo "📁 Files created:"
ls -la workflows/ 2>/dev/null || echo "No workflow files found"
echo
echo "🔄 Next Steps:"
echo "1. Fill in credentials-backup.txt with actual values"
echo "2. Commit workflow files to git"
echo "3. Push to GitHub"
echo "4. Proceed with Google Cloud deployment"
echo
print_status "Export process completed! 🎉"