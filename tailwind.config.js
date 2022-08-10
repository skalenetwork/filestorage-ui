/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /./
    },
  ],
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#363A41",
          secondary: "#D9D9D9",
          "--rounded-btn": "0.25rem",
          "--btn-text-case": "default",
          "--btn-focus-scale": "0.98"
        },

      },
      "night"
    ]
  },
}