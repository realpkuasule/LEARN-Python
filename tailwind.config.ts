import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        raised: "var(--surface-raised)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        success: "var(--success)",
        danger: "var(--error)",
      },
      boxShadow: {
        pixel: "4px 4px 0 var(--border-dark)",
        "pixel-sm": "2px 2px 0 var(--border-dark)",
      },
    },
  },
  plugins: [],
};

export default config;
