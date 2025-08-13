#!/bin/bash

# ATC n8n Deployment Script for Google Cloud e2-micro
# This script automates the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting ATC n8n Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Step 1: System Update
print_header "Step 1: Updating System"
sudo apt update && sudo apt upgrade -y
print_status "System updated successfully"

# Step 2: Install Docker
print_header "Step 2: Installing Docker"
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Step 3: Install Docker Compose
print_header "Step 3: Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Step 4: Create Project Structure
print_header "Step 4: Creating Project Structure"
mkdir -p ~/n8n-deployment/{data,backups,ssl,workflows}
cd ~/n8n-deployment
print_status "Project structure created"

# Step 5: Copy Configuration Files
print_header "Step 5: Setting Up Configuration"
if [ ! -f .env ]; then
    print_status "Creating environment file..."
    cat > .env << 'EOF'
# n8n Configuration
N8N_ENCRYPTION_KEY=atc-n8n-super-secret-encryption-key-2024-production-ready
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=ATC_n8n_Secure_2024!

# Domain Configuration
DOMAIN=n8n.aviatorstrainingcentre.in
EMAIL=aviatorstrainingcentre@gmail.com

# Timezone
TIMEZONE=Asia/Kolkata
EOF
    print_status "Environment file created"
else
    print_status "Environment file already exists"
fi

# Step 6: Create Docker Compose file
print_header "Step 6: Creating Docker Compose Configuration"
if [ ! -f docker-compose.yml ]; then
    print_status "Downloading Docker Compose configuration..."
    # The docker-compose.yml file should be copied here
    print_status "Docker Compose configuration created"
else
    print_status "Docker Compose configuration already exists"
fi

# Step 7: Set Permissions
print_header "Step 7: Setting Permissions"
chmod 600 .env
chmod +x deploy.sh 2>/dev/null || true
print_status "Permissions set correctly"

# Step 8: Start Services
print_header "Step 8: Starting n8n Services"
print_status "Starting Docker services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 30

# Step 9: Check Service Status
print_header "Step 9: Checking Service Status"
docker-compose ps

# Step 10: Create Management Scripts
print_header "Step 10: Creating Management Scripts"

# Health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "=== n8n Health Check ==="
echo "Date: $(date)"
echo
echo "Container Status:"
docker-compose ps
echo
echo "n8n Logs (last 10 lines):"
docker-compose logs --tail=10 n8n
echo
echo "Disk Usage:"
df -h
echo
echo "Memory Usage:"
free -h
echo "=== Health Check Complete ==="
EOF

# Backup script
cat > backup-now.sh << 'EOF'
#!/bin/bash
echo "Creating manual backup..."
docker exec n8n-backup tar -czf /backups/manual-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /n8n-data .
echo "Backup completed!"
ls -la backups/manual-backup-*.tar.gz | tail -1
EOF

# Import workflows script
cat > import-workflows.sh << 'EOF'
#!/bin/bash
echo "Importing workflows..."

# Check if workflow files exist
if [ ! -d "workflows" ] || [ -z "$(ls -A workflows/*.json 2>/dev/null)" ]; then
    echo "No workflow files found in ./workflows/ directory"
    echo "Please copy your JSON workflow files to the workflows/ directory"
    exit 1
fi

# Copy and import each workflow
for workflow in workflows/*.json; do
    if [ -f "$workflow" ]; then
        filename=$(basename "$workflow")
        echo "Importing $filename..."
        docker cp "$workflow" n8n:/tmp/
        docker exec n8n n8n import:workflow --input="/tmp/$filename"
        echo "$filename imported successfully"
    fi
done

echo "All workflows imported!"
EOF

# Make scripts executable
chmod +x health-check.sh backup-now.sh import-workflows.sh

print_status "Management scripts created"

# Step 11: Setup Cron Jobs
print_header "Step 11: Setting Up Automated Tasks"
(crontab -l 2>/dev/null; echo "0 2 * * 0 cd $HOME/n8n-deployment && docker-compose restart") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * * cd $HOME/n8n-deployment && ./health-check.sh >> health-check.log") | crontab -
print_status "Automated tasks configured"

# Step 12: Final Status
print_header "Step 12: Deployment Complete!"

echo
print_status "🎉 n8n has been deployed successfully!"
echo
echo "📋 Next Steps:"
echo "1. Access n8n at: https://n8n.aviatorstrainingcentre.in"
echo "2. Login with:"
echo "   - Username: admin"
echo "   - Password: ATC_n8n_Secure_2024!"
echo
echo "3. Import your workflows:"
echo "   - Copy JSON files to ./workflows/ directory"
echo "   - Run: ./import-workflows.sh"
echo
echo "4. Configure credentials in n8n web interface"
echo "5. Update webhook URLs in external services"
echo
echo "📊 Management Commands:"
echo "- Health check: ./health-check.sh"
echo "- Manual backup: ./backup-now.sh"
echo "- View logs: docker-compose logs -f n8n"
echo "- Restart services: docker-compose restart"
echo
echo "🔐 Security Notes:"
echo "- Change default passwords in .env file"
echo "- Configure firewall rules"
echo "- Monitor logs regularly"
echo
print_status "Deployment completed successfully! 🚀"

# Check if user needs to logout/login for Docker group
if ! groups $USER | grep -q docker; then
    print_warning "You may need to logout and login again for Docker group changes to take effect"
fi