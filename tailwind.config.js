/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./node_modules/tw-elements/dist/js/**/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      poppinsBody: ["Poppins", "sans-serif"],
      sourceCodeStyle: ["Source Code Pro", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
      staatliches: ["Staatliches", "sans-serif"]
    },
    screens: {
      sm: { min: "640px", max: "767px" },
      md: { min: "768px", max: "1197px" },
      lg: { min: "1024px", max: "1279px" },
      xl: { min: "1280px" },
    },
    extend: {
      animation: {
        'border': 'border 4s linear infinite',
    },
    keyframes: {
      'border': {
          to: { '--border-angle': '360deg' },
      }
  },
      backgroundColor: {
        "main-dark-bg": "#000",
        "secondary-dark-bg": "#121212",
        "half-transparent": "rgba(40, 40, 40, 0.6)",
      },
      width: {
        400: "400px",
        500: "500px",
        600: "600px",
        900: "900px"
      },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin.cjs"),
    require('flowbite/plugin') // Added this line
  ],
};
