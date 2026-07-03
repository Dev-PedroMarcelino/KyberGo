import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta KyberGo — preto profundo + verdes premium
        kyber: {
          black: "#050806",
          rich: "#0B0F0C",
          surface: "#101511",
          elevated: "#151B16",
          white: "#FFFFFF",
          soft: "#F5F7F5",
          green: "#00E676",
          deep: "#00A85A",
          neon: "#39FF88",
          mint: "#D9FFE8",
          gray: "#A7B0AA",
          dim: "#6B746E",
        },
        border: "rgba(255,255,255,0.10)",
        glass: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-sm": "0 0 20px -4px rgba(0,230,118,0.35)",
        glow: "0 0 40px -8px rgba(0,230,118,0.45)",
        "glow-lg": "0 0 80px -12px rgba(0,230,118,0.5)",
        card: "0 8px 32px rgba(0,0,0,0.35)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.5), 0 0 24px -8px rgba(0,230,118,0.25)",
      },
      backgroundImage: {
        "gradient-hero":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,230,118,0.14), transparent), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(0,168,90,0.10), transparent)",
        "gradient-green": "linear-gradient(135deg, #00E676 0%, #00A85A 100%)",
        "gradient-text": "linear-gradient(120deg, #FFFFFF 20%, #39FF88 50%, #00E676 80%)",
        "gradient-glass": "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px -4px rgba(0,230,118,0.35)" },
          "50%": { boxShadow: "0 0 48px -4px rgba(0,230,118,0.6)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
