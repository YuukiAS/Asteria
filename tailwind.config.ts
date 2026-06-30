import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: "rgb(var(--color-app) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        toolbar: "rgb(var(--color-toolbar) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        strongBorder: "rgb(var(--color-strong-border) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        block: "0 8px 24px rgba(15, 23, 42, 0.08)",
        float: "0 14px 36px rgba(15, 23, 42, 0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config
