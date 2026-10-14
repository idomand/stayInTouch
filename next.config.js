const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!firebaseProjectId) {
  throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
}

module.exports = withNextIntl({
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
    ];
  },
});
