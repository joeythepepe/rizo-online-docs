import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * A4 print template system — static product JSON + App Router SSG.
 * Export / smoke use `next start` on EXPORT_PORT (4173).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep trailingSlash false so /print/:id matches Playwright + client iframe URLs.
  poweredByHeader: false,
  // Avoid picking a parent monorepo lockfile as the workspace root.
  outputFileTracingRoot: rootDir,
};

export default nextConfig;
