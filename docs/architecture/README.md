# Architecture Documentation

This directory contains documentation about the system architecture, design decisions, and technical specifications for the Aviators Training Centre project.

## 📋 Available Documentation

### [Project Organization](./PROJECT_ORGANIZATION_COMPLETE.md)
Comprehensive overview of the project structure and organization:
- Directory structure
- Component organization
- Code organization principles
- Development workflow

## 🏗️ Architecture Overview

The Aviators Training Centre is built using modern web technologies with a focus on:
- **Performance**: Fast loading times and optimal user experience
- **Scalability**: Ability to handle growing traffic and content
- **Maintainability**: Clean, organized code that's easy to modify
- **Security**: Robust security measures and best practices

## 🔧 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library

### Backend & Services
- **Sanity CMS**: Headless content management system
- **Vercel**: Deployment and hosting platform
- **Meta Pixel**: Analytics and conversion tracking

### Development Tools
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control

## 📁 Project Structure

```
aviators-training-centre/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   │   ├── features/      # Feature-based components
│   │   ├── layout/        # Layout components
│   │   ├── shared/        # Shared components
│   │   └── ui/            # UI primitives
│   ├── lib/               # Utilities and services
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript definitions
├── docs/                  # Documentation
├── tools/                 # Development tools
├── tests/                 # Test suites
├── config/                # Configuration files
└── studio/                # Sanity CMS studio
```

## 🎯 Design Principles

1. **Feature-Based Organization**: Components are organized by business feature
2. **Separation of Concerns**: Clear separation between UI, logic, and data
3. **Type Safety**: Comprehensive TypeScript usage
4. **Performance First**: Optimized for speed and user experience
5. **Developer Experience**: Tools and structure that enhance productivity

## 🔄 Data Flow

1. **Content**: Managed in Sanity CMS
2. **Static Generation**: Next.js generates static pages at build time
3. **Client Hydration**: Interactive features load on the client
4. **Analytics**: User interactions tracked via Meta Pixel

## 🚀 Deployment Architecture

- **Build**: Next.js builds optimized static and server-side rendered pages
- **Deploy**: Vercel handles deployment and CDN distribution
- **Monitor**: Performance and error monitoring via built-in tools