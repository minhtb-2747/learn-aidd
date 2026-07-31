import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const DEFAULT_SUPABASE_URL = "http://127.0.0.1:54321";

/**
 * Allow-lists the Supabase Storage host that serves `kudo-images` public
 * URLs so `next/image` will render them (seeded rows keep their
 * app-relative `/images/kudos/...` paths, which need no remote pattern).
 * Derived from `SUPABASE_URL` rather than hardcoded so it keeps working if
 * the URL changes between environments; falls back to the local stack's
 * default if the env var is unset or not a valid URL (e.g. still a
 * placeholder), so the build never breaks on a bad env value.
 */
function supabaseImageRemotePattern() {
  let url: URL;
  try {
    url = new URL(process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL);
  } catch {
    url = new URL(DEFAULT_SUPABASE_URL);
  }

  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: "/storage/v1/object/public/**",
  };
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [supabaseImageRemotePattern()],
  },
  experimental: {
    serverActions: {
      // Default server-action body limit (~1MB) is smaller than the
      // bucket's own 5MB file_size_limit; raise it so a 5MB image plus
      // multipart/form-data overhead still fits.
      bodySizeLimit: "6mb",
    },
  },
};

// Points the plugin at the next-intl request config (cookie-mode i18n).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
