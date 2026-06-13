/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        forest: {
          950: "#0d1f16",
          900: "#1a3a2a",
          800: "#1f4a33",
          700: "#2d6a4f",
          600: "#3a8a67",
          500: "#4aa87e",
          400: "#6dc49a",
          300: "#9adcb8",
        },
        amber: {
          rms: "#e8a020",
          light: "#f5c05a",
        },
        cream: {
          50: "#f8f5f0",
          100: "#f0ebe0",
          200: "#e2d9c8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
