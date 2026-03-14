/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020202',
        card: '#0A0A0A',
        cardHover: '#121212',
        primary: '#00E054', // Pure Neon Green
        primaryDark: '#00C044',
        accent: '#BC00FF', // Toxic Purple
        textMain: '#FFFFFF',
        textMuted: '#9CA3AF',
      }
    },
  },
  plugins: [],
}
