# ATC AI Lead Qualification Workflow

This directory contains the complete AI-powered lead qualification system for Aviators Training Centre (ATC). The system automatically qualifies leads through voice calls, WhatsApp, and email using "Yukti" - an AI assistant designed for ultra-fast lead qualification.

## 🏗️ Directory Structure

```
ai-qualification/
├── config/                     # Configuration and validation
│   ├── credentials-template.json   # n8n credential patterns
│   └── validation.js              # Environment validation script
├── workflows/                   # n8n workflow definitions
│   ├── ATC_AI_Lead_Qualification.json
│   └── templates/               # Reusable workflow components
├── functions/                   # Function node implementations
│   ├── conversation-engine.js   # AI conversation logic
│   ├── qualification-scoring.js # Lead scoring algorithms
│   ├── provider-management.js   # AI provider failover
│   └── monitoring.js           # Performance monitoring
├── templates/                   # Message and email templates
│   ├── whatsapp/               # WhatsApp message templates
│   ├── email/                  # Email templates
│   └── voice/                  # Voice conversation scripts
├── tests/                      # Testing and validation
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── load/                   # Load testing scripts
├── docs/                       # Documentation
│   ├── setup-guide.md          # Setup instructions
│   ├── api-reference.md        # API documentation
│   └── troubleshooting.md      # Common issues and solutions
├── scripts/                    # Utility scripts
│   ├── deploy.sh              # Deployment script
│   ├── test-workflow.sh       # Testing script
│   └── backup.sh              # Backup procedures
└── .env.example               # Environment configuration template
```

## 🚀 Quick Start

1. **Copy Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

2. **Validate Configuration**
   ```bash
   node config/validation.js
   ```

3. **Import Workflow to n8n**
   - Open your n8n instance
   - Import `workflows/ATC_AI_Lead_Qualification.json`
   - Configure credentials using patterns from `config/credentials-template.json`

4. **Test the Workflow**
   ```bash
   ./scripts/test-workflow.sh
   ```

## 🔧 Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

### Required Configuration
- **OpenAI API Key**: For AI conversation engine
- **Twilio Credentials**: For voice calls and WhatsApp
- **Existing ATC Credentials**: Airtable, Gmail OAuth2
- **Webhook Security**: Bearer token for webhook authentication

### Optional Configuration
- Performance tuning parameters
- Cost control settings
- Monitoring and alerting preferences

## 🤖 How It Works

1. **Webhook Trigger**: Contact form submission triggers the workflow
2. **AI Qualification**: Yukti AI calls/chats with the lead (< 5 minutes)
3. **Smart Routing**: Qualified leads get booking links, unqualified get polite follow-up
4. **Multi-Channel**: Voice → WhatsApp → Email fallback system
5. **CRM Integration**: All interactions logged in existing Airtable system

## 📊 Features

- **Ultra-Fast Qualification**: 5-minute maximum per lead
- **Cost Optimized**: Single n8n execution per lead
- **Production Ready**: Comprehensive error handling and monitoring
- **Scalable**: Handles concurrent leads with queue management
- **Secure**: Bearer token auth, input sanitization, rate limiting

## 🔍 Monitoring

The system includes comprehensive monitoring:
- Real-time performance metrics
- Cost tracking and budget alerts
- Conversion rate analytics
- Error logging and alerting

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md) - Detailed setup instructions
- [API Reference](docs/api-reference.md) - Technical documentation
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🛠️ Development

For development and testing:
```bash
# Run validation
npm run validate

# Run tests
npm run test

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 🔒 Security

- Webhook authentication with Bearer tokens
- Input sanitization and validation
- Rate limiting and IP whitelisting
- Secure credential management
- Audit logging for all operations

## 📈 Performance

Optimized for:
- Single-run execution (1-2 n8n executions max per lead)
- Memory efficiency with streaming patterns
- Concurrent request handling
- Cost control with budget limits

## 🆘 Support

For issues or questions:
1. Check [Troubleshooting Guide](docs/troubleshooting.md)
2. Review logs in n8n execution history
3. Validate configuration with `node config/validation.js`
4. Contact system administrator

---

**Built for Aviators Training Centre** - Helping aspiring pilots soar to new heights! ✈️