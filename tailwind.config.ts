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
        "print-display": ["28pt", { lineHeight: "1.25", fontWeight: "700" }],
        "print-title": ["14pt", { lineHeight: "1.35", fontWeight: "700" }],
        "print-body": ["10.5pt", { lineHeight: "1.60", fontWeight: "400" }],
        "print-body-sm": ["9.5pt", { lineHeight: "1.50", fontWeight: "400" }],
        "print-label": ["8.5pt", { lineHeight: "1.40", fontWeight: "500" }],
        "print-meta": ["8pt", { lineHeight: "1.40", fontWeight: "400" }],
        "print-en-display": ["12pt", { lineHeight: "1.30", fontWeight: "400" }],
        "print-en-title": ["10pt", { lineHeight: "1.30", fontWeight: "400" }],
        "print-en-body": ["9pt", { lineHeight: "1.40", fontWeight: "400" }],
        "print-en-label": ["7.5pt", { lineHeight: "1.30", fontWeight: "400" }],
        "print-en-meta": ["7.5pt", { lineHeight: "1.30", fontWeight: "400" }],
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
