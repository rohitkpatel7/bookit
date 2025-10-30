/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { yellow: "#F7C948" } },
      borderRadius: { "2xl": "1rem" }
    },
  },
  plugins: [],
};
