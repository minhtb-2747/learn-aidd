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
function resolveSupabaseUrl(): URL {
  try {
    return new URL(process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL);
  } catch {
    return new URL(DEFAULT_SUPABASE_URL);
  }
}

const supabaseUrl = resolveSupabaseUrl();

/**
 * Next 16 refuses to let the image optimizer fetch a loopback or private
 * address — an SSRF guard, since the optimizer takes a URL from the query
 * string. Locally that guard blocks our own Supabase stack: every kudos
 * gallery image 404s with a bare `"url" parameter is not allowed`, which
 * reads like a `remotePatterns` problem and is not one. The real reason only
 * shows in the server log: `resolved to private ip`.
 *
 * So the escape hatch is tied to the Supabase host actually being loopback,
 * not to `NODE_ENV`. Point `SUPABASE_URL` at a real project and the guard
 * comes straight back on, which is what must happen in production.
 */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const supabaseIsLoopback = LOOPBACK_HOSTS.has(supabaseUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowLocalIP: supabaseIsLoopback,
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
