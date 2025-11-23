/**
 * Centralized Design System Configuration
 * 
 * This file controls all colors, fonts, and backgrounds for the entire application.
 * Change values here to update the design system globally.
 */

export const theme = {
  // ============================================
  // BRAND COLORS
  // ============================================
  colors: {
    // Primary brand color (teal/cyan)
    primary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#00BFA5', // Main primary color
      600: '#0891B2',
      700: '#0E7490',
      800: '#075985',
      900: '#0C4A6E',
    },

    // Cream/beige backgrounds
    cream: {
      50: '#FEF9F1',
      100: '#E9E1D4',
      200: '#B3B0A9',
      300: '#8B8578',
    },

    // Accent colors
    accent: {
      yellow: '#FFEB3B',
      pink: '#880E4F',
      green: '#A6E3B0',
      orange: '#FF7043',
      // Additional semantic colors
      success: '#A6E3B0',
      warning: '#FFEB3B',
      error: '#FF7043',
      info: '#00BFA5',
    },

    // Neutral grays
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#B3B0A9',
      500: '#737373',
      600: '#464440',
      700: '#404040',
      800: '#202020',
      900: '#171717',
    },

    // Semantic colors (mapped from accent for consistency)
    semantic: {
      // Feature icon backgrounds
      feature: {
        care: {
          bg: '#D1FAE5',      // emerald-100 equivalent
          icon: '#059669',     // emerald-600 equivalent
        },
        privacy: {
          bg: '#CFFAFE',      // cyan-100 equivalent
          icon: '#22D3EE',    // cyan-400 equivalent
        },
        community: {
          bg: '#FEF3C7',      // amber-100 equivalent
          icon: '#D97706',    // amber-600 equivalent
        },
      },
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  fonts: {
    display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
    
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ============================================
  // BACKGROUNDS
  // ============================================
  backgrounds: {
    // Page backgrounds
    page: {
      light: '#FEF9F1',      // cream-50
      dark: '#202020',       // neutral-800
      admin: '#0A0A0A',      // Very dark for admin
    },
    
    // Card/container backgrounds
    card: {
      light: '#FFFFFF',
      dark: '#1A1A1A',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    
    // Overlay backgrounds
    overlay: {
      light: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(0, 0, 0, 0.5)',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ============================================
  // BORDERS & SHADOWS
  // ============================================
  borders: {
    radius: {
      sm: '0.5rem',      // 8px
      md: '0.75rem',     // 12px
      lg: '1rem',        // 16px
      xl: '1.5rem',      // 24px
      '2xl': '2rem',     // 32px
      '3xl': '3rem',     // 48px
      full: '9999px',
    },
    
    colors: {
      light: '#E5E5E5',
      dark: '#404040',
      primary: '#00BFA5',
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // ============================================
  // BREAKPOINTS (for reference)
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Export type for TypeScript
export type Theme = typeof theme;

// Helper function to get CSS variable names
export const getCSSVariable = (path: string): string => {
  return `--${path.replace(/\./g, '-')}`;
};

