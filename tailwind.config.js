/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Roboto', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        yt: {
          black: '#0F0F0F',
          dark: '#18181B',
          gray: '#52525B',
          muted: '#71717A',
          subtle: '#A1A1AA',
          border: '#E4E4E7',
          chipBg: '#F4F4F5',
          chipHover: '#E4E4E7',
          blue: '#065FD4',
          red: '#FF0033',
        },
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
      }
    },
  },
  plugins: [],
}
