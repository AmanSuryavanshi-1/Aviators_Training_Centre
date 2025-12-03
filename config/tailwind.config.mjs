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
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        heading: ['var(--font-montserrat)', ...fontFamily.sans],
        body: ['var(--font-inter)', ...fontFamily.sans],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.aviation.text'),
            '--tw-prose-headings': theme('colors.aviation.primary'),
            '--tw-prose-links': theme('colors.aviation.primary'),
            '--tw-prose-bold': theme('colors.aviation.primary'),
            '--tw-prose-counters': theme('colors.aviation.primary'),
            '--tw-prose-bullets': theme('colors.aviation.primary'),
            '--tw-prose-hr': theme('colors.aviation.accent'),
            '--tw-prose-quotes': theme('colors.aviation.secondary'),
            '--tw-prose-quote-borders': theme('colors.aviation.primary'),
            '--tw-prose-captions': theme('colors.aviation.text'),
            '--tw-prose-code': theme('colors.aviation.primary'),
            '--tw-prose-pre-code': theme('colors.white'),
            '--tw-prose-pre-bg': theme('colors.aviation.text'),
            '--tw-prose-th-borders': theme('colors.aviation.primary'),
            '--tw-prose-td-borders': theme('colors.aviation.accent'),

            maxWidth: 'none',

            // Links
            a: {
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s',
              '&:hover': {
                color: theme('colors.aviation.secondary'),
                textDecoration: 'underline',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              },
            },

            // Dark Mode Overrides
            '.dark &': {
              '--tw-prose-body': theme('colors.foreground'),
              '--tw-prose-headings': theme('colors.teal.300'),
              '--tw-prose-links': theme('colors.teal.400'),
              '--tw-prose-bold': theme('colors.teal.200'),
              '--tw-prose-counters': theme('colors.teal.400'),
              '--tw-prose-bullets': theme('colors.teal.400'),
              '--tw-prose-hr': theme('colors.teal.600'),
              '--tw-prose-quotes': theme('colors.teal.300'),
              '--tw-prose-quote-borders': theme('colors.teal.600'),
              '--tw-prose-captions': theme('colors.teal.100'),
              '--tw-prose-code': theme('colors.teal.200'),
              '--tw-prose-th-borders': theme('colors.teal.600'),
              '--tw-prose-td-borders': theme('colors.teal.700'),
            },
          },
        },
      }),
    },
  },
  plugins: [tailwindcssAnimate, typography],
};

export default config;