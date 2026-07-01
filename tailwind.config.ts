import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn semantic core — driven by :root vars (alpha-aware)
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },

        // Editorial palette — flat hex, light-only
        paper: "#FBFAF7",
        "paper-deep": "#F1EEE6",
        panel: "#F4F1E9",
        ink: {
          DEFAULT: "#1A1A17",
          deep: "#15140F",
        },
        body: "#3C3A33",
        "muted-ink": "#5A574C",
        faint: "#8A8578",
        hairline: "#ECE8DE",
        "card-edge": "#E7E2D6",
        "input-edge": "#D8D3C6",
        brand: {
          DEFAULT: "#1F6F4A",
          hover: "#1A5C3D",
          "on-dark": "#7FE3A6",
        },
        deal: "#C2410C",
        star: "#C2410C",
        savings: {
          DEFAULT: "#15803D",
          bg: "#DCFCE7",
        },
        award: {
          DEFAULT: "#92400E",
          bg: "#FEF3C7",
        },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 12px)",
        pill: "100px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(26, 26, 23, 0.05)",
        card: "0 1px 2px 0 rgba(26, 26, 23, 0.04), 0 1px 3px 0 rgba(26, 26, 23, 0.03)",
        "card-hover":
          "0 2px 4px -1px rgba(26, 26, 23, 0.06), 0 24px 48px -20px rgba(26, 26, 23, 0.32)",
        "card-lift":
          "0 2px 4px -1px rgba(26, 26, 23, 0.05), 0 32px 64px -24px rgba(26, 26, 23, 0.4)",
        popover: "0 18px 40px -16px rgba(26, 26, 23, 0.4)",
        modal: "0 30px 80px -24px rgba(21, 20, 15, 0.6)",
        glow: "0 0 0 1px rgba(31, 111, 74, 0.08), 0 24px 56px -20px rgba(31, 111, 74, 0.3)",
        "brand-cta": "0 8px 24px -8px rgba(31, 111, 74, 0.45)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "live-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(43, 213, 118, 0.55)" },
          "70%": { boxShadow: "0 0 0 6px rgba(43, 213, 118, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(43, 213, 118, 0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "live-pulse": "live-pulse 2s infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

