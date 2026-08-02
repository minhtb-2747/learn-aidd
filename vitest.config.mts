import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Unit tests only. The seven `page.tsx` screens are async Server Components,
 * which no DOM test renderer can mount — they return a Promise and reach for
 * `cookies()`, next-intl's server APIs and Supabase. Covering them means E2E,
 * not this config; what runs here is `lib/` logic and client components.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["{lib,components,app}/**/*.test.{ts,tsx}"],
    css: false,
  },
});
