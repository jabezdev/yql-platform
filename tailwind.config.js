/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      colors: {
        yql: {
          blue: '#1E40AF',
          red: '#DC2626',
          dark: '#111827',
        },
        brand: {
          // ── 3-token blue scale ──────────────────────────────
          // darkBlue  (#2f567f) → hover/press on brand-blue surfaces
          // blue      (#396799) → PRIMARY: all text, borders, active fills
          // lightBlue (#3d8ccb) → secondary: icons, links, subtle fills
          // ────────────────────────────────────────────────────
          darkBlue: '#2f567f',
          blue: '#396799',
          lightBlue: '#3d8ccb',
          yellow: '#fed432',
          wine: '#bc594f',
          // true error/danger colour, distinct from wine
          red: '#ef4444',
          // success / positive indicator states
          green: '#10b981',
          gray: '#97abc4',
          bgLight: '#f5f6f8',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulseSlow 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
