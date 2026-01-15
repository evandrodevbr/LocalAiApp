/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Como você já usa o @fontsource/inter, vamos integrá-lo aqui
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
