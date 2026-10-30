// AutoForge v1.7 Tailwind Configuration
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EAE4D8',
          400: '#DDD5C7',
          500: '#C8BEAD',
        },
        ink: {
          950: '#07090D',
          900: '#0D1117',
          850: '#121620',
          800: '#171C28',
          700: '#232A3B',
          text: '#0D1117',
          muted: '#525B6F',
        },
        teal: {
          electric: '#00F2FE',
          electricGlow: 'rgba(0, 242, 254, 0.35)',
          deep: '#0D9488',
          subtle: 'rgba(0, 242, 254, 0.12)',
        },
        forge: {
          bg: '#07090E',
          surface: '#FAF7F2',
          elevated: '#F4EFE6',
          border: 'rgba(0, 242, 254, 0.18)',
          borderHover: 'rgba(0, 242, 254, 0.4)',
          accent: '#00F2FE',
          cyan: '#00F2FE',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          muted: '#525B6F',
        }
      }
    },
  },
  plugins: [],
}
