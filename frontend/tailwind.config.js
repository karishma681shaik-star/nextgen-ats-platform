/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        navy: {
          950: '#030610',
          900: '#060b18',
          850: '#0a1024',
          800: '#0f172a',
          750: '#15213d',
          700: '#1e293b',
        },
        slate: {
          850: '#121a2c',
          900: '#0a0f1d',
          950: '#040711',
        },
        cyan: {
          450: '#00d2ff',
        },
        emerald: {
          450: '#10e793',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        serif: ['Tinos', '"Times New Roman"', 'Times', 'Georgia', 'serif'],
        garamond: ['"EB Garamond"', 'Garamond', 'Georgia', 'serif'],
        lora: ['Lora', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 14px 35px -5px rgba(0, 0, 0, 0.6), 0 6px 16px -4px rgba(99, 102, 241, 0.25)',
        'glow': '0 0 25px -2px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 45px -5px rgba(99, 102, 241, 0.65)',
        'glow-emerald': '0 0 25px -2px rgba(16, 185, 129, 0.5)',
        'glow-purple': '0 0 25px -2px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 25px -2px rgba(6, 182, 212, 0.5)',
        'glow-rose': '0 0 25px -2px rgba(244, 63, 94, 0.5)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-delayed': 'float 5s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'radar': 'radar 4s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'scanline': 'scanline 2.5s ease-in-out infinite',
        'border-beam': 'borderBeam 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        borderBeam: {
          '0%': { 'offset-distance': '0%' },
          '100%': { 'offset-distance': '100%' },
        }
      }
    },
  },
  plugins: [],
}
