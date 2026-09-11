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
        ink: {
          900: "#0B1B2B",
          700: "#334155",
          500: "#64748B",
          400: "#94A3B8",
        },
        mist: "#F3F7FB",
        teal: {
          50: "#EFFAF7",
          100: "#D7F2EB",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          900: "#134E4A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 27, 43, 0.04), 0 8px 32px -12px rgba(11, 27, 43, 0.12)",
        "soft-lg": "0 2px 4px rgba(11, 27, 43, 0.05), 0 20px 56px -16px rgba(11, 27, 43, 0.18)",
        glow: "0 8px 24px -8px rgba(13, 148, 136, 0.45)",
      },
      borderRadius: {
        card: "1.25rem",
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.4s ease both",
        "float-slow": "floatSlow 14s ease-in-out infinite",
        "float-slower": "floatSlow 20s ease-in-out infinite reverse",
        pop: "pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulseRing 2.4s ease-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(40px, -30px) scale(1.08)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
