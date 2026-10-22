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
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e6',
          700: '#1e2d42',
          800: '#141e2d',
          900: '#0c131d',
          950: '#070b12',
        },
        crimson: {
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
        },
        medical: {
          teal: '#0d9488',
          emerald: '#10b981',
          slate: '#334155',
          amber: '#f59e0b',
          blue: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
