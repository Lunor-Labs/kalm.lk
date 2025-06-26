/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors from the guide
        cream: {
          50: '#FEF9F1',
          100: '#E9E1D4',
          200: '#B3B0A9',
        },
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#00BFA5',
          600: '#0891B2',
          700: '#0E7490',
        },
        accent: {
          yellow: '#FFEB3B',
          pink: '#880E4F',
          green: '#A6E3B0',
          orange: '#FF7043',
        },
        neutral: {
          400: '#B3B0A9',
          600: '#464440',
          800: '#202020',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};