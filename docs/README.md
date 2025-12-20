# Aviators Training Centre Documentation

> **Complete technical documentation for the ATC codebase**

Last Updated: December 20, 2025

---

## 🚀 Quick Start

| Need To | Read This |
|---------|-----------|
| Get started quickly | [Quick Start Developer Guide](QUICK_START_DEVELOPER.md) |
| Understand the architecture | [Architecture Overview](ARCHITECTURE_OVERVIEW.md) |
| See all features | [Feature Inventory](FEATURE_INVENTORY.md) |
| Fix something broken | [Troubleshooting](troubleshooting/COMMON_ISSUES.md) |

---

## 📚 Documentation Index

### Core Architecture
| Document | Description |
|----------|-------------|
| [Feature Inventory](FEATURE_INVENTORY.md) | Complete feature catalog with status and files |
| [Architecture Overview](ARCHITECTURE_OVERVIEW.md) | System design, tech stack, request flows |
| [Component Architecture](COMPONENT_ARCHITECTURE.md) | React component patterns and organization |
| [API Integration](API_INTEGRATION.md) | External services and API endpoints |
| [Database Schema](DATABASE_SCHEMA.md) | Sanity CMS and Firebase schemas |
| [Implementation Patterns](IMPLEMENTATION_PATTERNS.md) | Code patterns and best practices |
| [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) | Deployment process and configuration |
| [Performance Tuning](PERFORMANCE_TUNING.md) | Optimization strategies and metrics |

### Feature Guides
| Document | Description |
|----------|-------------|
| [SEO Implementation](features/seo-implementation.md) | Meta tags, structured data, AI crawlers |
| [Analytics System](features/analytics-system.md) | GA4, Firebase, Meta Pixel tracking |
| [Form Validation](features/form-validation.md) | Client and server-side validation |
| [Blog System](features/blog-system.md) | Sanity CMS blog integration |
| [CMS Sanity](features/cms-sanity.md) | Headless CMS configuration |
| [Image Optimization](features/image-optimization.md) | Next.js image optimization |
| [Authentication](features/authentication.md) | JWT auth and security |
| [Admin Dashboard](features/admin-dashboard.md) | Analytics dashboard |
| [Email Service](features/email-service.md) | Resend integration |
| [Performance](features/performance-optimization.md) | Core Web Vitals |

### Quick References
| Document | Description |
|----------|-------------|
| [Quick Start](QUICK_START_DEVELOPER.md) | Get running in 10 minutes |
| [Data Flow Summary](DATA_FLOW_SUMMARY.md) | Visual data flow diagrams |
| [Troubleshooting](troubleshooting/COMMON_ISSUES.md) | Common issues and fixes |
| [Changelog](CHANGELOG.md) | Documentation updates |

---

## 🤖 N8N Automation System

N8N handles automated emails and follow-up sequences. Start here to understand how it works.

### Quick Start (Read These First)

| Document | Time | Description |
|----------|------|-------------|
| [N8N System Overview](n8n/OVERVIEW.md) | 5 min | What is N8N and why we use it |
| [Contact Form Data Flow](n8n/CONTACT_FORM_DATA_FLOW.md) | 10 min | Where does form data go? |
| [Workflows Summary](n8n/WORKFLOWS_SUMMARY.md) | 8 min | All active workflows listed |

### N8N Quick Reference

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| Contact Form | Form submit | Send emails + save data |
| Follow-up Sequence | User added | 3 emails over 24 days |
| Cancellation | Unsubscribe | Remove from emails |

### Key Integration Points

| Component | File | Purpose |
|-----------|------|---------|
| Contact API | `src/app/api/contact/route.ts` | Triggers N8N |
| Email Service | Resend | Sends emails |
| Database | Firebase + N8N | Stores data |

### Common N8N Questions

| Question | Answer |
|----------|--------|
| "What emails do users get?" | See [Workflows Summary](n8n/WORKFLOWS_SUMMARY.md) |
| "How do I stop emailing someone?" | See [Cancellation Workflow](n8n/WORKFLOWS_SUMMARY.md#workflow-3-cancellation-request-processing) |
| "Why isn't someone getting email?" | See [Troubleshooting](troubleshooting/COMMON_ISSUES.md#email-issues) |
| "How do I add a follow-up email?" | See existing N8N technical docs |
| "What data is stored where?" | See [Database Schema](DATABASE_SCHEMA.md) |

---

## 🔧 Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.4.8 | React framework |
| React | 18 | UI library |
| TypeScript | 5.5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Sanity | 3 | Headless CMS |
| Firebase | 10 | Database + Auth |
| Resend | - | Email service |
| N8N | - | Workflow automation |

---

## 📁 Project Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components (200+)
├── lib/           # Core libraries (220+ files)
└── hooks/         # Custom React hooks (18)

studio/            # Sanity CMS Studio
docs/              # This documentation
```

---

## 🔗 External Resources

| Resource | URL |
|----------|-----|
| Production Site | https://www.aviatorstrainingcentre.in |
| Sanity Studio | https://www.aviatorstrainingcentre.in/studio |
| Vercel Dashboard | https://vercel.com/dashboard |
| Resend Dashboard | https://resend.com/dashboard |
| Firebase Console | https://console.firebase.google.com |

---

## 📊 Documentation Stats

| Category | Count |
|----------|-------|
| Core Architecture Docs | 8 |
| Feature Guides | 10 |
| N8N Docs | 3 |
| Supporting Docs | 6 |
| **Total** | **27** |

---

## ✏️ Contributing to Docs

When updating documentation:

1. Follow existing formatting patterns
2. Update [CHANGELOG.md](CHANGELOG.md) with changes
3. Ensure all links work
4. Keep code examples up to date

---

## 📝 Document Status

| Status | Meaning |
|--------|---------|
| ✅ Complete | Fully documented |
| 🔄 In Progress | Being updated |
| ⚠️ Needs Review | May be outdated |

All documents currently: ✅ Complete (December 2025)
