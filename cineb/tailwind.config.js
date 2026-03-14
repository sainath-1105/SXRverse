/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1c1917', // Deep warm stone
        card: '#292524',       // Warm stone
        cardHover: '#44403c',  // Lighter stone
        primary: '#fbbf24',    // Warm Amber/Gold
        primaryDark: '#d97706',
        accent: '#fca5a5',     // Soft Coral/Peach
        textMain: '#fafaf9',   // Warm white
        textMuted: '#d6d3d1',   // Stone 300
      }
    },
  },
  plugins: [],
}
