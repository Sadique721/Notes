import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base surfaces
        surface: {
          base: "#05060A",
          elevated: "#0B0F1A",
          panel: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
        },
        // Module accent palette (GOD MODE v3 §4.2)
        module: {
          spring: "#10E39B",       // Spring Framework Fundamentals — Emerald
          "spring-boot": "#22D3EE", // Spring Boot — Cyan
          annotations: "#38BDF8",  // Spring Boot Annotations — Sky
          microservices: "#A78BFA", // Microservices — Violet
          collections: "#FBBF24",  // Java Collections — Amber
          java8: "#E879F9",        // Java 8/17/21 — Fuchsia
          multithreading: "#FB7185", // Multithreading & Concurrency — Rose
          sql: "#A3E635",          // SQL — Lime
          jvm: "#FB923C",          // JVM — Orange
          "core-java": "#60A5FA",  // Core Java — Blue
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-fast": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
        "energy-flow": "energyFlow 1.5s linear infinite",
        "aurora": "aurora 8s ease-in-out infinite alternate",
        "grain": "grain 0.5s steps(1) infinite",
        "draw-path": "drawPath 0.8s ease-out forwards",
        "shimmer": "shimmer 2.5s linear infinite",
        "slide-up": "slideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
        "slide-down": "slideDown 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
        "ripple": "ripple 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)" },
        },
        energyFlow: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%", opacity: "0.6" },
          "50%": { backgroundPosition: "100% 50%", opacity: "0.9" },
          "100%": { backgroundPosition: "0% 50%", opacity: "0.6" },
        },
        grain: {
          "0%, 100%": { backgroundPosition: "0 0" },
          "10%": { backgroundPosition: "-5% -10%" },
          "20%": { backgroundPosition: "-15% 5%" },
          "30%": { backgroundPosition: "7% -25%" },
          "40%": { backgroundPosition: "20% 25%" },
          "50%": { backgroundPosition: "-25% 10%" },
          "60%": { backgroundPosition: "15% 5%" },
          "70%": { backgroundPosition: "0% 15%" },
          "80%": { backgroundPosition: "25% 35%" },
          "90%": { backgroundPosition: "-10% 10%" },
        },
        drawPath: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px 2px var(--glow-color, rgba(16,227,155,0.3))",
        "glow-md": "0 0 20px 4px var(--glow-color, rgba(16,227,155,0.3))",
        "glow-lg": "0 0 40px 8px var(--glow-color, rgba(16,227,155,0.3))",
        "glass": "0 8px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-heavy": "0 16px 48px 0 rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        "tilt-3d": "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "aurora-1": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.3), transparent)",
        "aurora-2": "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(16,227,155,0.2), transparent)",
        "aurora-3": "radial-gradient(ellipse 50% 30% at 20% 80%, rgba(167,139,250,0.2), transparent)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
        "shimmer": "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        "module-spring": "radial-gradient(circle at 30% 50%, rgba(16,227,155,0.15) 0%, transparent 70%)",
        "module-microservices": "radial-gradient(circle at 30% 50%, rgba(167,139,250,0.15) 0%, transparent 70%)",
        "module-jvm": "radial-gradient(circle at 30% 50%, rgba(251,146,60,0.15) 0%, transparent 70%)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "100": "25rem",
        "120": "30rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};

export default config;
