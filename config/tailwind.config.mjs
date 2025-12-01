/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const config = {
  // Enable JIT mode (default in Tailwind CSS v3+)
  mode: 'jit',

  darkMode: ['class'],

  // Optimized content paths for aggressive CSS purging
  content: [
    // App directory
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',

    // Components
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',

    // Lib utilities
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',

    // All src files
    './src/**/*.{js,ts,jsx,tsx,mdx}',

    // Public files
    './public/**/*.{js,ts,jsx,tsx,mdx}',

    // Styles
    './src/styles/**/*.{css,scss}',
    './styles/**/*.{css,scss}',
  ],

  // Safelist for dynamically generated classes
  safelist: [
    // Color variants for dynamic classes (SocialProofIntegration, ErrorDisplay)
    'text-yellow-500', 'text-yellow-600', 'text-yellow-400',
    'bg-yellow-100', 'bg-yellow-900/30',
    'text-blue-500', 'text-blue-600', 'text-blue-400',
    'bg-blue-100', 'bg-blue-900/30',
    'text-green-500', 'text-green-600', 'text-green-400',
    'bg-green-100', 'bg-green-900/30',
    'text-purple-500', 'text-purple-600', 'text-purple-400',
    'bg-purple-100', 'bg-purple-900/30',
    'text-red-500', 'text-red-600', 'text-red-400',
    'bg-red-100', 'bg-red-900/30',
    'text-teal-500', 'text-teal-600', 'text-teal-400',
    'bg-teal-100', 'bg-teal-900/30',

    // Animation patterns
    {
      pattern: /animate-(spin|pulse|bounce|ping)/,
    },

    // Transform patterns
    {
      pattern: /-?rotate-(0|45|90|180)/,
    },

    // Transition patterns  
    {
      pattern: /transition-(all|colors|opacity|transform)/,
    },
  ],

  prefix: '',

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        aviation: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          primary: '#075E68',    /* Deep teal */
          secondary: '#0C6E72',  /* Dark teal */
          tertiary: '#219099',   /* Medium teal */
          accent: '#56A7B0',     /* Light teal */
          light: '#73B5BD',      /* Pale teal */
          text: '#1F2937',       /* Dark grey */
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-roboto)', ...fontFamily.sans],
        heading: ['var(--font-montserrat)', ...fontFamily.sans],
        inter: ['var(--font-inter)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
};

export default config;