/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // True cinematic black
        surface: '#121212',    // Layered surface
        card: '#1a1a1a',       //深黑色
        primary: '#ffffff',    // Pure white for high contrast
        accent: '#c5a059',     // Editorial Gold/Champagne
        softAccent: '#8e9196', // Muted slate for hierarchy
        textMain: '#f8f8f8',   // Slightly off-white
        textMuted: '#a1a1aa',  // Zinc 400
      },
      fontFamily: {
        heading: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cinematic-overlay': 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0) 100%)',
      }
    },
  },
  plugins: [],
}
