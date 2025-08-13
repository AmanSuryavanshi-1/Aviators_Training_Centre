# Aviators Training Centre - Aviation Training Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-3.88.2-red?logo=sanity)](https://sanity.io/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.1-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-blue?logo=tailwindcss)](https://tailwindcss.com/)

A comprehensive, production-ready aviation training platform combining Next.js 15, Sanity CMS, Firebase, and advanced analytics for professional content management and user engagement.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0+
- npm or yarn
- Git
- Service accounts for: [Sanity](https://sanity.io), [Firebase](https://firebase.google.com), [Vercel](https://vercel.com), [Resend](https://resend.com)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd aviators-training-centre
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your service credentials

# Start development
npm run dev                    # Main app (http://localhost:3000)
cd studio && npm run dev       # Sanity Studio (http://localhost:3333)
```

### Access Points

- **Website**: http://localhost:3000
- **Sanity Studio**: http://localhost:3333  
- **Admin Dashboard**: http://localhost:3000/admin

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**Developer Guide**](./DEVELOPER_GUIDE.md) | Complete setup, environment, scripts, and troubleshooting |
| [**Components Reference**](./COMPONENTS_REFERENCE.md) | Component documentation and API reference |
| [**Architecture Guide**](./docs/ARCHITECTURE.md) | System design and technical architecture |
| [**API Documentation**](./docs/API.md) | API endpoints and integration guide |

### Key Features

- **Content Management**: Sanity CMS with rich editor, versioning, and scheduled publishing
- **Analytics & Tracking**: Real-time analytics, conversion tracking, and performance monitoring
- **Form Validation**: Advanced validation with Indian phone/email formats
- **SEO Optimization**: Automated meta tags, structured data, and Core Web Vitals optimization
- **Performance**: Next.js 15 with ISR, image optimization, and CDN delivery

## 🛠 Tech Stack

### Core Framework
- **Next.js 15** with App Router and React 18
- **TypeScript** with strict type checking
- **Tailwind CSS** with custom aviation theme

### Backend & Services  
- **Sanity CMS** for content management
- **Firebase** (Firestore + Auth) for analytics and authentication
- **Resend API** for transactional emails
- **Vercel** hosting with edge functions

### Development Tools
- **ESLint** + **Jest** + **Playwright** for testing
- **TypeScript** path mapping with @ aliases

## 📁 Project Structure

```
├── src/                    # Application source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility libraries and configurations
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── studio/               # Sanity CMS Studio (separate Node.js app)
├── docs/                 # Project documentation
├── tests/                # Test suites (unit, integration, e2e)
├── tools/                # Build tools and automation scripts
└── .kiro/                # Kiro AI specifications and steering
```

## 🔧 Development

### Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm test                       # Type checking and linting
npm run test:unit              # Unit tests
npm run test:e2e               # End-to-end tests

# Content Management
npm run migrate:blog           # Migrate blog content
npm run blog:populate-images   # Auto-populate blog images

# Production
npm run production:setup      # Production environment setup
npm run deploy:production     # Full production deployment
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Core Configuration
NEXT_PUBLIC_SITE_URL=[your_domain]
NEXT_PUBLIC_SANITY_PROJECT_ID=[your_sanity_project_id]
SANITY_API_TOKEN=[your_sanity_api_token]

# Firebase
FIREBASE_API_KEY=[your_firebase_api_key]
FIREBASE_PROJECT_ID=[your_firebase_project_id]
FIREBASE_PRIVATE_KEY="[your_firebase_private_key]"

# Email & Admin
RESEND_API_KEY=[your_resend_api_key]
ADMIN_USERNAME=[your_admin_username]
ADMIN_PASSWORD=[your_admin_password]
```

⚠️ **IMPORTANT**: Replace all placeholder values with your actual credentials.

## 🧪 Testing

```bash
npm test                       # Run all tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e               # End-to-end tests
npm run test:coverage          # Test with coverage
```

## 🚀 Deployment

### Production Deployment

```bash
# Validate configuration
npm run production:validate

# Deploy Sanity Studio
cd studio && npx sanity deploy

# Deploy to Vercel
vercel --prod
```

### Automated Deployment

- **GitHub Actions**: CI/CD pipeline
- **Vercel Integration**: Automatic deployments on push
- **Sanity Webhooks**: Content-triggered rebuilds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Submit a pull request

### Code Standards

- **TypeScript**: All code must be typed
- **ESLint**: Follow configured linting rules
- **Testing**: New features require tests
- **Conventional Commits**: Use conventional commit format

## 📞 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Create GitHub issues for bugs or feature requests
- **Troubleshooting**: See [Developer Guide](./DEVELOPER_GUIDE.md#troubleshooting)

## 📄 License

This project is proprietary and confidential. All rights reserved by Aviators Training Centre.

---

**For detailed setup instructions, see the [Developer Guide](./DEVELOPER_GUIDE.md)**