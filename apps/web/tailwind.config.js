import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue[600],
        secondary: colors.indigo[600],
        neutral: colors.slate,
      }
    },
  },
  plugins: [],
}
