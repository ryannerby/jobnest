export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Montserrat'", "system-ui", "sans-serif"],
        sans: ["'Open Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#ffffff",
        blue: {
          accent: "#4A70FF",
          light: "#5C85FF",
          dark: "#3A5FEF",
        },
        stone: "#000000",
        gray: {
          light: "#f8f9fa",
          medium: "#6c757d",
          dark: "#343a40",
        },
      },
    },
  },
  plugins: [],
}