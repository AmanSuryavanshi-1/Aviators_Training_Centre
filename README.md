# Skybound Aviator Academy

## Project Overview

Skybound Aviator Academy is a modern web application for a premier flight training center. The website showcases the academy's courses, instructors, scheduling capabilities, and provides information for aspiring pilots.

## Features

- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme toggle for user preference
- **Course Information**: Detailed information about available flight training courses
- **Instructor Profiles**: Information about the academy's professional instructors
- **Scheduling System**: Interactive scheduling interface for booking training sessions
- **FAQ Section**: Comprehensive answers to common questions
- **Contact Form**: Easy way for potential students to get in touch

## Technology Stack

This project is built with:

- **Vite**: Fast, modern frontend build tool
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **React Router**: For navigation and routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind CSS
- **React Query**: For data fetching and state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/Aviators-Training-Center.git
   cd Aviators-Training-Center
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Build for Production

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── home/        # Home page specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components from shadcn/ui
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── App.tsx          # Main App component
│   ├── index.css        # Global styles
│   └── main.tsx         # Entry point
├── .gitignore           # Git ignore file
├── components.json      # shadcn/ui configuration
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Deployment

This project can be deployed to any static hosting service such as Vercel, Netlify, or GitHub Pages.

### Deployment Steps

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your hosting provider

## Custom Domain Setup

To connect a custom domain to your deployed project:

1. Purchase a domain from a domain registrar
2. Configure DNS settings according to your hosting provider's instructions
3. Set up SSL certificates for secure HTTPS connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries about the Skybound Aviator Academy, please contact us through the form on our website or at info@skyboundaviator.academy.
