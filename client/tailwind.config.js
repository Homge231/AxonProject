/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hexred: '#E63946',
        orange: '#FF7B00',
        lightOrange: '#FFA62B',
        blue: '#3B82F6',
        lightBlue: '#60A5FA',
        darkNavy: '#0F172A',
        white: '#F8FAFC',
        success: '#22C55E'
      }
    },
  },
  plugins: [],
}