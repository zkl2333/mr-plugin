/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  daisyui: {
    themes: [
      "light",
      {
        dark: {
          "base-100": "#222",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
