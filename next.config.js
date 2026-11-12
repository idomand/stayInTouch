const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!firebaseProjectId) {
  throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
}

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
if (!posthogHost) {
  throw new Error("NEXT_PUBLIC_POSTHOG_HOST is not set");
}

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (!posthogKey) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

module.exports = withNextIntl({
  // PostHog API paths end in a slash (/e/, /flags/). Without this, Next.js
  // answers each one with a 308 redirect before the proxy rewrite runs.
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  turbopack: {},
  experimental: {
    // Every page reads cookies (locale, session), so every page is dynamic, and
    // dynamic pages are not kept in the client router cache by default (0 s).
    // Keep them 5 min so revisits are instant. Server Actions that call
    // revalidatePath or set a cookie clear this cache, so own writes still show.
    staleTimes: { dynamic: 300 },
  },
  // firebase-admin pulls in ESM-only `jose` via `jwks-rsa`. When Turbopack
  // bundles it into the serverless function, its require() shim throws
  // ERR_REQUIRE_ESM at runtime (dev works, the built function does not). Keeping
  // firebase-admin external makes Node load it natively, where require(esm) is
  // supported.
  serverExternalPackages: ["firebase-admin"],
  // Browsers must always fetch the service worker fresh, or a deploy keeps
  // running the old one.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  // Serve Firebase's auth handler from our own domain, so Google's account
  // chooser names stay-in-touch.vip instead of <project>.firebaseapp.com. Only
  // used when NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set to our domain. The target
  // is built from the project id, not the auth domain, or it would point here.
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseProjectId}.firebaseapp.com/__/auth/:path*`,
      },
      // PostHog reverse proxy: the browser sends analytics to our own domain, so
      // ad blockers that block posthog.com do not drop events. The path is
      // app-specific on purpose; blockers know /ingest and /analytics. The
      // specific asset rules must come before the catch-all, because the first
      // match wins. Assets have no env var: change both hosts if the region moves.
      {
        source: "/friendship/static/:path*",
        destination: `https://eu-assets.i.posthog.com/static/:path*`,
      },
      {
        source: "/friendship/array/:path*",
        destination: `https://eu-assets.i.posthog.com/array/:path*`,
      },
      {
        source: "/friendship/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
});
