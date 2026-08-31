import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crono: {
          white: "#FAFAFA",
          gray: "#939599",
          lightgray: "#CDCDCF",
          turquoise: "#2BCFCE",
          coral: "#EC4D25",
          dark: "#0E1015",
          surface: "#151821",
          card: "#1A1E29",
          border: "#282E3E",
          cardlight: "#EAECEF",
        },
        ufc: {
          red: "#EC4D25",
          turquoise: "#2BCFCE",
          gray: "#939599",
          lightgray: "#CDCDCF",
          dark: "#0E1015",
          gold: "#E5A93C",
        }
      },
      fontFamily: {
        sport: ['"Barlow Condensed"', 'Oswald', 'sans-serif'],
        display: ['Teko', '"Barlow Condensed"', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'cage-pattern': "radial-gradient(#2BCFCE 0.75px, transparent 0.75px), radial-gradient(#EC4D25 0.75px, #0E1015 0.75px)",
      }
    },
  },
  plugins: [],
};
export default config;

