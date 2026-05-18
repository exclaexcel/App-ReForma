import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terracota: {
          DEFAULT: "#C84B31",
          light: "#D97757",
          dark: "#A83820",
        },
        chocolate: {
          DEFAULT: "#5C3A21",
          light: "#7a4f30",
          dark: "#3d2616",
        },
      },
    },
  },
  plugins: [],
};
export default config;
