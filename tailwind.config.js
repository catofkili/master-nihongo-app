/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans SC",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        jp: ["Noto Sans JP", "Hiragino Sans", "Yu Gothic", "sans-serif"]
      }
    }
  },
  plugins: []
};
