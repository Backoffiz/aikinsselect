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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#7C3AED", // Slightly darker violet (Violet 600) for stronger impact
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Select Blue
          foreground: "#FFFFFF", // White
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F3E8FF", // Violet 100 for softer backgrounds
          foreground: "#5B21B6", // Violet 800 ensures readability
        },
        accent: {
          DEFAULT: "#14B8A6", // Teal 500 introduces vibrancy and complements violet well
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#FFFFFF", // White
          foreground: "#1E293B", // Deep Slate
        },
        card: {
          DEFAULT: "#FFFFFF", // White
          foreground: "#1E293B", // Deep Slate
        },
        // Custom color palette
        violet: {
          DEFAULT: "#7C3AED", // Violet 600
          light: "#A78BFA", // Violet 400
          dark: "#5B21B6", // Violet 800
          50: "#F5F3FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        teal: {
          DEFAULT: "#14B8A6", // Teal 500
          light: "#5EEAD4", // Teal 300
          dark: "#0F766E", // Teal 700
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        slate: {
          DEFAULT: "#1E293B", // Deep Slate
          light: "#334155",
          dark: "#0F172A",
        },
        blue: {
          DEFAULT: "#3B82F6", // Select Blue
          light: "#60A5FA",
          dark: "#2563EB",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "violet-sm": "0 1px 2px 0 rgba(124, 58, 237, 0.05)",
        "violet-md": "0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -1px rgba(124, 58, 237, 0.06)",
        "teal-sm": "0 1px 2px 0 rgba(20, 184, 166, 0.05)",
        "teal-md": "0 4px 6px -1px rgba(20, 184, 166, 0.1), 0 2px 4px -1px rgba(20, 184, 166, 0.06)",
        "blue-sm": "0 1px 2px 0 rgba(59, 130, 246, 0.05)",
        "blue-md": "0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "violet-gradient": "linear-gradient(to right, #F3E8FF, #DDD6FE)",
        "teal-gradient": "linear-gradient(to right, #14B8A6, #5EEAD4)",
        "blue-gradient": "linear-gradient(to right, #3B82F6, #60A5FA)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

