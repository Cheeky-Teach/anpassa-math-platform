/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist ensures dynamic classes (e.g., bg-pink-50) are generated even if not hardcoded
  safelist: [
    {
      pattern: /(bg|text|border|ring|border)-(pink|indigo|emerald|purple|primary)-(50|100|200|500|600|700)/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: { 
            50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 
            300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 
            600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' 
        },
        accent: { 
            50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 
            300: '#fdba74', 400: '#fb923c', 500: '#f97316', 
            600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' 
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in': 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
            '0%': { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}