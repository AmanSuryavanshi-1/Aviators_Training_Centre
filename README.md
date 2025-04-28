# Aviator Training Center 

## Project Overview

ATC is a modern web application for a premier flight training center, built with Next.js 14 and the App Router. The website showcases the academy's courses, instructors, scheduling capabilities, provides information for aspiring pilots, and includes a blog.

## Features

- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices.
- **Dark/Light Mode**: Theme toggle for user preference.
- **Blog**: Markdown-based blog with dynamic rendering and SEO optimization.
- **Course Information**: Detailed information about available flight training courses.
- **Instructor Profiles**: Information about the academy's professional instructors.
- **Scheduling System**: Interactive scheduling interface for booking training sessions.
- **FAQ Section**: Comprehensive answers to common questions.
- **Contact Form**: Easy way for potential students to get in touch.
- **Performance**: Leverages Next.js Static Site Generation (SSG) and Server Components for optimal performance.
- **SEO Optimized**: Dynamic meta tags and JSON-LD schema for better search rankings.

## Technology Stack

This project is built with:

- **Next.js 14**: React framework with App Router for server components, routing, and performance optimizations.
- **React**: JavaScript library for building user interfaces.
- **TypeScript**: Typed JavaScript for better developer experience.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind CSS.
- **React Query**: For data fetching and state management (can be used alongside Next.js caching).
- **react-markdown / gray-matter**: For parsing and rendering Markdown blog content.
- **Firebase**: Backend for potential features like real-time data or CMS integration (optional).

## Getting Started

### Prerequisites

- Node.js (v18.17 or higher recommended for Next.js 14)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Aviators-Training-Center-Next.git
   cd Aviators-Training-Center-Next
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## Project Structure (Using App Router)

```
├── app/                     # Main application directory (App Router)
│   ├── api/                 # API routes
│   ├── blog/                # Blog specific routes and components
│   │   ├── [slug]/          # Dynamic route for blog posts
│   │   │   └── page.tsx
│   │   └── page.tsx         # Blog listing page
│   ├── (main)/              # Route group for main site pages (optional)
│   │   ├── about/           # Example page route
│   │   │   └── page.tsx
│   │   ├── courses/         # Example page route
│   │   │   └── page.tsx
│   │   └── ...              # Other main site pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable UI components (or place inside src/)
│   ├── home/                # Home page specific components
│   ├── layout/              # Layout components (Header, Footer)
│   ├── shared/              # Components shared across multiple pages
│   └── ui/                  # UI components from shadcn/ui
├── content/                 # Content directory
│   └── blog/                # Markdown files for blog posts
│       └── example-post.md
├── hooks/                   # Custom React hooks (or place inside src/)
├── lib/                     # Utility functions, constants (or place inside src/)
├── public/                  # Static assets (images, fonts, etc.)
├── src/                     # Optional directory for organizing non-route code
│   ├── components/          # Alternative location for components
│   ├── hooks/
│   ├── lib/
│   └── ...
├── .env.local               # Environment variables (local)
├── .gitignore               # Git ignore file
├── components.json          # shadcn/ui configuration
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Deployment

This project is optimized for deployment on platforms like Vercel (recommended) or Firebase Hosting.

### Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Import the project into Vercel.
3. Vercel will automatically detect Next.js, build, and deploy the application.

### Firebase Hosting

1. Set up a Firebase project: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login: `firebase login`
4. Initialize Firebase: `firebase init hosting` (select your project, use `.next` as the public directory - requires adjusting build output if needed, configure as a single-page app: No)
5. Build the project: `npm run build`
6. Deploy: `firebase deploy --only hosting`
   *Note: For optimal SSG/ISR with Firebase, you might need Firebase Functions integration or adjustments to `next.config.js` (`output: 'export'`). Refer to Next.js and Firebase documentation for advanced hosting setups.*

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details (if applicable).

## Contact

For any inquiries about the Aviator Training Center, please contact us through the form on our website or at aviatorstrainingcentre@gmail.com.
