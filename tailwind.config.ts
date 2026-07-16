import type { Config } from "tailwindcss";

/**
 * Frozen print design tokens — single source of truth for A4 templates.
 * Do not add parallel spacing systems or font-weight 600.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#1D1D1F",
          secondary: "#6E6E73",
          tertiary: "#86868B",
        },
        rule: "#D2D2D7",
        accent: "#0071E3",
        soft: "#F5F5F7",
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // CJK needs generous line-height so glyphs are not clipped by tight boxes
        "print-display": ["26pt", { lineHeight: "1.35", fontWeight: "700" }],
        "print-title": ["13pt", { lineHeight: "1.45", fontWeight: "700" }],
        "print-body": ["10.5pt", { lineHeight: "1.65", fontWeight: "400" }],
        "print-body-sm": ["9.5pt", { lineHeight: "1.55", fontWeight: "400" }],
        "print-label": ["8.5pt", { lineHeight: "1.45", fontWeight: "500" }],
        "print-meta": ["8pt", { lineHeight: "1.45", fontWeight: "400" }],
      },
      spacing: {
        "mm-1": "1mm",
        "mm-2": "2mm",
        "mm-4": "4mm",
        "mm-6": "6mm",
        "mm-8": "8mm",
        "mm-12": "12mm",
        "mm-14": "14mm",
      },
      width: {
        a4: "210mm",
      },
      height: {
        a4: "297mm",
      },
      borderRadius: {
        chip: "2mm",
        none: "0",
      },
    },
  },
  plugins: [],
};

export default config;
