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
        // Primary brand colors from the vibrant palette
        primary: {
          blue: "#0367FC",
          lime: "#D2F801",
          white: "#FFFFFF",
          charcoal: "#161616",
        },
        // Sophisticated greys from the first palette
        neutral: {
          pebble: "#EEEEEE",
          cadet: "#3A4750",
          highTide: "#313841",
        },
        // Semantic colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      boxShadow: {
        'punch': '0 8px 32px rgba(3, 103, 252, 0.15)',
        'lime-glow': '0 4px 20px rgba(210, 248, 1, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}