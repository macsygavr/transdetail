import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "media",
  content: ["./src/**/*.{html,js,jsx,ts,tsx,mdx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--ubuntu)", "sans-serif"],
      },
      colors: {
        // sekuya: "#EF4323",
        // red: {
        //   5000: "#EF4323",
        //   600: "#DD2B0A",
        // },
        // gray: {
        //   100: "#F7F6FA",
        //   200: "#F5F5F5",
        //   300: "#E8E8E8",
        //   400: "#D4D4D4",
        //   500: "#A0A0A0",
        //   600: "#8E909A",
        //   700: "#B7B7B7",
        //   800: "#333C48",
        //   900: "#282C34",
        // },
        // blue: {
        //   500: "#2B3990",
        //   600: "#428AFF",
        //   700: "#E7F0FF",
        // },
        // green: {
        //   500: "#1AAF4C",
        //   600: "#EDFFF0",
        // },
        // yellow: {
        //   500: "#FFB852",
        // },
        // purple: {
        //   500: "#E8E8F3",
        // },
        // beige: {
        //   500: "#FFF5E7",
        //   600: "#FFFCEC",
        // },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
