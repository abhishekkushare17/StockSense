/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6f8',
          100: '#e4e7ec',
          200: '#cecfd2',
          300: '#9ea7b4',
          400: '#647285',
          500: '#394a5f',
          600: '#1b2839',
          700: '#151f2d',
          800: '#0f1722',
          900: '#0a0f16',
          950: '#05080c',
        },
        indigo: {
          50: '#f4f6f8',
          100: '#e4e7ec',
          200: '#cecfd2',
          300: '#9ea7b4',
          400: '#647285',
          500: '#394a5f',
          600: '#1b2839',
          700: '#151f2d',
          800: '#0f1722',
          900: '#0a0f16',
          950: '#05080c',
        },
      },
    },
  },
  plugins: [],
}
