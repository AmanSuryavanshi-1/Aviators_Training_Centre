#!/bin/bash

# Google Cloud VM Setup Script for n8n Deployment
# Run this script locally to create and configure the VM

set -e

echo "🌩️ Setting up Google Cloud VM for n8n..."
echo "========================================"

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

# Configuration - UPDATE THESE VALUES
PROJECT_ID="aviators-training-centre-2024"  # Replace with your actual project ID
ZONE="us-central1-a"
INSTANCE_NAME="n8n-production"
MACHINE_TYPE="e2-micro"
DOMAIN="n8n.aviatorstrainingcentre.in"

print_header "Step 1: Creating VM Instance"

# Create VM instance
print_status "Creating e2-micro instance..."
gcloud compute instances create $INSTANCE_NAME \
  --zone=$ZONE \
  --machine-type=$MACHINE_TYPE \
  --network-tier=PREMIUM \
  --maintenance-policy=MIGRATE \
  --image=ubuntu-2004-focal-v20240307 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --boot-disk-device-name=$INSTANCE_NAME \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
    apt update
    apt install -y curl wget git
    echo "VM setup completed" > /var/log/startup.log'

print_status "VM instance created successfully"

print_header "Step 2: Configuring Firewall Rules"

# Create firewall rules
print_status "Creating firewall rules..."
gcloud compute firewall-rules create allow-n8n-http \
  --allow tcp:80,tcp:443,tcp:5678 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server,https-server \
  --description "Allow HTTP/HTTPS traffic for n8n" || true

print_status "Firewall rules configured"

print_header "Step 3: Getting VM Information"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

print_status "VM External IP: $EXTERNAL_IP"

print_header "Step 4: DNS Configuration"

echo
echo "📋 Manual DNS Configuration Required:"
echo "======================================"
echo "1. Go to your domain registrar (e.g., Cloudflare, GoDaddy)"
echo "2. Add/Update these DNS records:"
echo
echo "   Type: A"
echo "   Name: n8n"
echo "   Value: $EXTERNAL_IP"
echo "   TTL: 300 (5 minutes)"
echo
echo "   Type: A"
echo "   Name: traefik"
echo "   Value: $EXTERNAL_IP"
echo "   TTL: 300 (5 minutes)"
echo
echo "3. Wait for DNS propagation (5-10 minutes)"
echo "4. Test with: nslookup $DOMAIN"
echo

print_header "Step 5: Connecting to VM"

echo "🔗 Connection Commands:"
echo "======================"
echo
echo "1. Connect via SSH:"
echo "   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo
echo "2. Copy deployment files:"
echo "   gcloud compute scp --recurse ./atc-n8n-meeting-scheduler $INSTANCE_NAME:~/ --zone=$ZONE"
echo
echo "3. Run deployment script:"
echo "   cd ~/atc-n8n-meeting-scheduler && chmod +x deploy.sh && ./deploy.sh"
echo

print_header "Step 6: Deployment Instructions"

echo "📋 Next Steps:"
echo "=============="
echo
echo "1. Wait for DNS propagation"
echo "2. Connect to VM: gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "3. Copy files: gcloud compute scp --recurse ./atc-n8n-meeting-scheduler $INSTANCE_NAME:~/ --zone=$ZONE"
echo "4. Run: cd ~/atc-n8n-meeting-scheduler && ./deploy.sh"
echo "5. Access n8n at: https://$DOMAIN"
echo

print_header "Step 7: Cost Optimization"

echo "💰 Cost Optimization Tips:"
echo "=========================="
echo "1. e2-micro is free tier eligible (750 hours/month)"
echo "2. 20GB standard disk is within free tier"
echo "3. Monitor usage in Google Cloud Console"
echo "4. Set up billing alerts"
echo "5. Stop VM when not needed: gcloud compute instances stop $INSTANCE_NAME --zone=$ZONE"
echo

print_status "Google Cloud setup completed! 🎉"

echo
echo "🔧 Useful Commands:"
echo "=================="
echo "Start VM:    gcloud compute instances start $INSTANCE_NAME --zone=$ZONE"
echo "Stop VM:     gcloud compute instances stop $INSTANCE_NAME --zone=$ZONE"
echo "SSH to VM:   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "Delete VM:   gcloud compute instances delete $INSTANCE_NAME --zone=$ZONE"
echo "View logs:   gcloud compute instances get-serial-port-output $INSTANCE_NAME --zone=$ZONE"
echo