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
});
