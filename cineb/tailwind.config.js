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
        primary: '#3B82F6', // Clean Blue
        primaryDark: '#2563EB',
        accent: '#EF4444', // Alert Red
        textMain: '#FFFFFF',
        textMuted: '#9CA3AF',
      }
    },
  },
  plugins: [],
}
