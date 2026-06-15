/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FE
        hexred: '#E63946',
        orange: '#FF7B00',
        lightOrange: '#FFA62B',
        blue: '#3B82F6',
        lightBlue: '#60A5FA',
        darkNavy: '#0F172A',
        white: '#F8FAFC',
        success: '#22C55E',
        
        // BE
        'primary-fixed': '#7df4ff',
        'background': '#10131a',
        'surface-container': '#1d2026',
        'surface-container-high': '#272a31',
        'surface-container-highest': '#32353c',
        'on-surface': '#e1e2eb',
        'on-surface-variant': '#b9cacb',
        'secondary': '#ebb2ff',
        'tertiary-fixed': '#5bffa1',
        'outline-variant': '#3b494b',
        'error': '#ffb4ab',
      }
    },
  },
  plugins: [],
}