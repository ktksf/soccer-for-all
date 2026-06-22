import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soccer-themed palette: pitch green, chalk white, slate dark gray
        pitch: {
          50: "#eefdf3",
          100: "#d6f9e1",
          200: "#aff1c6",
          300: "#79e4a4",
          400: "#3fce7d",
          500: "#17b35e", // primary green
          600: "#0c904b",
          700: "#0c723e",
          800: "#0e5a34",
          900: "#0d4a2c",
          950: "#022915",
        },
        chalk: "#fbfdfb",
        slate: {
          750: "#293548",
          850: "#172033",
          950: "#0b1220",
        },
      },
      fontFamily: {
        // Display: condensed athletic; Body: clean grotesque
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "ball-roll": {
          "0%": { transform: "translateX(-120%) rotate(0deg)" },
          "100%": { transform: "translateX(120%) rotate(720deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pitch-stripe": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 0" },
        },
      },
      animation: {
        "ball-roll": "ball-roll 1.6s cubic-bezier(0.4,0,0.2,1) infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "pitch-stripe": "pitch-stripe 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
