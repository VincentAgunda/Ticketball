/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0b1b32",   // main text
          beige: "#ede6e6",  // neutral background
          gray: "#dee0e0",   // borders/muted text
          light: "#f2f4f8",  // subtle background
          white: "#ffffff",  // background + cards
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)",
        subtle: "0 2px 6px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
