import { defineConfig } from "@playwright/test";
import { EXPORT_PORT } from "./src/export/pdf";

/**
 * Playwright config for export / e2e smoke.
 * CLI export (scripts/export-pdf.ts) starts `next start` itself for simplicity;
 * this config is the canonical webServer bootstrap for `bun run test:smoke`.
 *
 * Prerequisite: `bun run build` so `.next/` exists before start
 * (`test:smoke` runs build first).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${EXPORT_PORT}`,
    headless: true,
    viewport: { width: 1200, height: 1600 },
  },
  webServer: {
    command: `bunx next start -H 127.0.0.1 -p ${EXPORT_PORT}`,
    url: `http://127.0.0.1:${EXPORT_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
