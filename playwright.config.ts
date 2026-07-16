import { EXPORT_PORT } from "./src/export/pdf";

/**
 * Playwright config for export / optional e2e.
 * CLI export (scripts/export-pdf.ts) starts vite preview itself for simplicity;
 * this config documents the canonical webServer bootstrap for test runners.
 *
 * Prerequisite: `pnpm build` so `dist/` exists before preview.
 */
export default {
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://127.0.0.1:${EXPORT_PORT}`,
    headless: true,
    viewport: { width: 1200, height: 1600 },
  },
  webServer: {
    command: `pnpm vite preview --port ${EXPORT_PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${EXPORT_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};
