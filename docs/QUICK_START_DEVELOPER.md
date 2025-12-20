# Quick Start Developer Guide

> **Get up and running in 10 minutes**

Last Updated: December 20, 2025

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

---

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Aviators_Training_Centre

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create `.env.local` with required variables:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx

# Admin Auth
ADMIN_JWT_SECRET=your-32-character-secret-here

# Email (for contact form)
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@example.com
OWNER1_EMAIL=owner@example.com

# Optional: N8N
N8N_CONTACT_WEBHOOK_URL=https://xxx
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key URLs

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/blog` | Blog listing |
| `/courses` | Courses listing |
| `/contact` | Contact form |
| `/admin` | Admin dashboard |
| `/studio` | Sanity CMS Studio |

---

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── api/             # API routes
│   └── admin/           # Admin pages
│
├── components/          # React components
│   ├── ui/              # UI primitives (shadcn)
│   ├── features/        # Feature components
│   └── admin/           # Admin dashboard
│
├── lib/                 # Core libraries
│   ├── analytics/       # Analytics tracking
│   ├── auth/            # Authentication
│   ├── blog/            # Blog utilities
│   ├── firebase/        # Firebase config
│   ├── n8n/             # N8N integration
│   └── sanity/          # Sanity client
│
└── hooks/               # Custom React hooks
```

---

## Common Tasks

### Add New Page

```typescript
// src/app/new-page/page.tsx
export const metadata = {
  title: 'New Page | Aviators Training Centre',
};

export default function NewPage() {
  return <div>New page content</div>;
}
```

### Add New API Route

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

### Add New Component

```typescript
// src/components/features/example/ExampleCard.tsx
interface ExampleCardProps {
  title: string;
  description: string;
}

export function ExampleCard({ title, description }: ExampleCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

### Fetch Data from Sanity

```typescript
import { client } from '@/lib/sanity/client';
import { groq } from 'next-sanity';

const posts = await client.fetch(groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug
  }
`);
```

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Testing Contact Form Locally

1. Start dev server: `npm run dev`
2. Go to `/contact`
3. Fill form and submit
4. Check:
   - Vercel function logs (terminal)
   - Firebase console for saved data
   - Email inbox (if Resend configured)

---

## Testing Admin Dashboard

1. Start dev server: `npm run dev`
2. Go to `/admin/login`
3. Login with Sanity member credentials
4. Access dashboard at `/admin`

---

## Sanity Studio

### Access Studio

```bash
cd studio
npm install
npm run dev
```

Open [http://localhost:3333](http://localhost:3333)

### Create Blog Post

1. Go to Studio → Posts → Create
2. Fill required fields (title, slug, category)
3. Add content using rich text editor
4. Set `publishedAt` date
5. Click Publish

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Required Environment Variables in Vercel

All variables from `.env.local` must be added to Vercel:
1. Go to Vercel Dashboard → Project → Settings
2. Click Environment Variables
3. Add each variable for Production scope

---

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Sanity Connection Issues

```bash
# Test Sanity connection
npx sanity debug --secrets
```

### Type Errors

```bash
# Check TypeScript
npx tsc --noEmit
```

---

## Need Help?

| Question | Documentation |
|----------|---------------|
| How does X feature work? | [Feature Inventory](FEATURE_INVENTORY.md) |
| What's the architecture? | [Architecture Overview](ARCHITECTURE_OVERVIEW.md) |
| How to deploy? | [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) |
| Something broken? | [Troubleshooting](troubleshooting/COMMON_ISSUES.md) |
| N8N automations? | [N8N Overview](n8n/OVERVIEW.md) |

---

## Quick Links

- [Full Feature Inventory](FEATURE_INVENTORY.md)
- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [API Integration](API_INTEGRATION.md)
- [Component Architecture](COMPONENT_ARCHITECTURE.md)
