// const withPWA = require("next-pwa");

// module.exports = withPWA({
//   reactStrictMode: true,
//   pwa: {
//     dest: "public",
//     register: true,
//     skipWaiting: true,
//     // disable: process.env.NODE_ENV === 'development'
//   },
// });

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Uncomment the following line if you want to disable PWA in development
  // disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  reactStrictMode: true,
  turbopack: {},
  // firebase-admin pulls in ESM-only `jose` via `jwks-rsa`. When Turbopack
  // bundles it into the serverless function, its require() shim throws
  // ERR_REQUIRE_ESM at runtime (dev works, the built function does not). Keeping
  // firebase-admin external makes Node load it natively, where require(esm) is
  // supported.
  serverExternalPackages: ["firebase-admin"],
});
