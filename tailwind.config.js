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
        pastel: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardSubtle: '#F1F5F9',
          border: '#E2E8F0',
          lavender: '#EDE9FE',
          lavenderDark: '#6D28D9',
          sky: '#E0F2FE',
          skyDark: '#0369A1',
          mint: '#D1FAE5',
          mintDark: '#047857',
          peach: '#FFE4E6',
          peachDark: '#BE123C',
          amber: '#FEF3C7',
          amberDark: '#B45309',
        },
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
