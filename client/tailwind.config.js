/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#172D50',
        teal: '#087F8C',
        ivory: '#F6F4EE',
      }
    },
  },
  plugins: [],
}