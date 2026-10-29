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
        background: '#090d16',
        card: '#111726',
        accent: '#6366f1',
        border: '#1f293d',
        brand: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          orange: '#f97316',
          green: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
