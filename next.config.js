const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

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
});
