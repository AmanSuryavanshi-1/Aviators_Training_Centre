/**
 * ATC Brand Theme Configuration
 * Centralized theme tokens matching the main website design system
 */

// Extract exact colors from main website (styles/globals.css and config/tailwind.config.mjs)
export const ATCColors = {
  // Primary brand colors (HSL format for consistency with main website)
  primary: 'hsl(187, 87%, 22%)',      // #075E68 - Deep teal
  primaryDark: 'hsl(185, 80%, 25%)',  // #0C6E72 - Dark teal  
  secondary: 'hsl(184, 63%, 36%)',    // #219099 - Medium teal
  tertiary: 'hsl(184, 35%, 51%)',     // #56A7B0 - Light teal
  accent: 'hsl(184, 32%, 60%)',       // #73B5BD - Pale teal
  
  // UI colors for dark theme
  background: 'hsl(187, 30%, 12%)',   // Dark navy background
  surface: 'hsl(187, 30%, 15%)',      // Panel/card background
  surfaceElevated: 'hsl(187, 30%, 18%)', // Elevated surfaces
  border: 'hsl(187, 30%, 22%)',       // Border color
  
  // Text colors
  text: 'hsl(185, 30%, 95%)',         // Primary text (light)
  textMuted: 'hsl(185, 20%, 75%)',    // Secondary text
  textDimmed: 'hsl(185, 15%, 60%)',   // Tertiary text
  
  // Semantic colors
  success: 'hsl(142, 76%, 36%)',      // Green
  warning: 'hsl(38, 92%, 50%)',       // Orange
  error: 'hsl(0, 84%, 60%)',          // Red
  info: 'hsl(199, 89%, 48%)',         // Blue
  
  // Interactive states
  hover: 'rgba(7, 94, 104, 0.1)',     // Primary with 10% opacity
  selected: 'rgba(7, 94, 104, 0.2)',  // Primary with 20% opacity
  focus: 'hsl(187, 87%, 22%)',        // Primary for focus rings
} as const;

// Typography configuration matching main website
export const ATCTypography = {
  fontFamily: "'Roboto', system-ui, sans-serif",
  headingFamily: "'Montserrat', system-ui, sans-serif",
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing system (16px base)
export const ATCSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// Component styling
export const ATCComponents = {
  borderRadius: '8px',
  borderRadiusLg: '12px',
  borderRadiusXl: '16px',
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Z-index layers for proper stacking
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// Complete theme configuration interface
export interface ATCThemeConfig {
  colors: typeof ATCColors;
  typography: typeof ATCTypography;
  spacing: typeof ATCSpacing;
  components: typeof ATCComponents;
}

// Export complete theme
export const ATCTheme: ATCThemeConfig = {
  colors: ATCColors,
  typography: ATCTypography,
  spacing: ATCSpacing,
  components: ATCComponents,
} as const;

// CSS Custom Properties for use in stylesheets
export const generateCSSCustomProperties = () => `
  /* ATC Brand Colors */
  --atc-primary: ${ATCColors.primary};
  --atc-primary-dark: ${ATCColors.primaryDark};
  --atc-secondary: ${ATCColors.secondary};
  --atc-tertiary: ${ATCColors.tertiary};
  --atc-accent: ${ATCColors.accent};
  
  /* UI Colors */
  --atc-background: ${ATCColors.background};
  --atc-surface: ${ATCColors.surface};
  --atc-surface-elevated: ${ATCColors.surfaceElevated};
  --atc-border: ${ATCColors.border};
  
  /* Text Colors */
  --atc-text: ${ATCColors.text};
  --atc-text-muted: ${ATCColors.textMuted};
  --atc-text-dimmed: ${ATCColors.textDimmed};
  
  /* Semantic Colors */
  --atc-success: ${ATCColors.success};
  --atc-warning: ${ATCColors.warning};
  --atc-error: ${ATCColors.error};
  --atc-info: ${ATCColors.info};
  
  /* Interactive States */
  --atc-hover: ${ATCColors.hover};
  --atc-selected: ${ATCColors.selected};
  --atc-focus: ${ATCColors.focus};
  
  /* Typography */
  --atc-font-family: ${ATCTypography.fontFamily};
  --atc-heading-family: ${ATCTypography.headingFamily};
  
  /* Spacing */
  --atc-spacing-xs: ${ATCSpacing.xs};
  --atc-spacing-sm: ${ATCSpacing.sm};
  --atc-spacing-md: ${ATCSpacing.md};
  --atc-spacing-lg: ${ATCSpacing.lg};
  --atc-spacing-xl: ${ATCSpacing.xl};
  
  /* Components */
  --atc-border-radius: ${ATCComponents.borderRadius};
  --atc-border-radius-lg: ${ATCComponents.borderRadiusLg};
  --atc-border-radius-xl: ${ATCComponents.borderRadiusXl};
  
  /* Z-Index */
  --atc-z-modal-backdrop: ${ATCComponents.zIndex.modalBackdrop};
  --atc-z-modal: ${ATCComponents.zIndex.modal};
`;