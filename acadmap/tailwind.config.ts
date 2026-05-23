import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gaucho: {
          blue: {
            DEFAULT: "#003660",
            light: "#004D9F",
            dark: "#002847",
          },
          gold: {
            DEFAULT: "#FEBC11",
            light: "#FFD966",
            dark: "#D99A00",
          },
        },
        acadmap: {
          primary: "var(--acad-primary)",
          accent: "var(--acad-accent)",
          surface: "var(--acad-surface)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 54, 96, 0.06), 0 1px 3px rgba(0, 54, 96, 0.08)",
        "card-dark": "0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
