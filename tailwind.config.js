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
        forge: {
          bg: '#07090E',
          surface: '#0F121C',
          elevated: '#151926',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          accent: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          muted: '#8E9BB5',
        }
      }
    },
  },
  plugins: [],
}
