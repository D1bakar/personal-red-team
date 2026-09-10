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
        cream: "#FFFBF0",
        sand: "#E8E4DA",
        danger: "#FF3B3B",
        success: "#22C55E",
        warning: "#FBBF24",
        info: "#3B82F6",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000",
        "brutal-sm": "2px 2px 0px 0px #000",
        "brutal-lg": "6px 6px 0px 0px #000",
        "brutal-none": "0px 0px 0px 0px #000",
      },
      animation: {
        "brutalist-in": "brutalistIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up": "fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pop": "pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
