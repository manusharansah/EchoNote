import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef0ff",
          100: "#dde1ff",
          200: "#bcc3ff",
          300: "#959fff",
          400: "#6e79f7",
          500: "#4f5ae8",
          600: "#3b41c4",
          700: "#3137a0",
          800: "#262a78",
          900: "#1c1f57",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)",
        glow: "0 10px 40px -10px rgba(59, 65, 196, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,0.61,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
