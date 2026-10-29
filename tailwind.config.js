/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forge: {
          bg: '#0a0d14',
          surface: '#111520',
          elevated: '#171c2b',
          border: '#23293d',
          accent: '#3b82f6',
          accentGlow: '#60a5fa',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          muted: '#8e9bb5',
        }
      }
    },
  },
  plugins: [],
}
