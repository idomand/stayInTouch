import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint 9 flat config. Replaces the legacy `.eslintrc.json`, which crashed
 * under ESLint 9 + eslint-config-next 16.
 *
 * `eslint-config-next/core-web-vitals` bundles the Next, React, react-hooks,
 * jsx-a11y and import plugins; `eslint-config-next/typescript` bundles
 * typescript-eslint's recommended set. Both come from eslint-config-next's own
 * dependencies, so nothing extra is installed for them.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // tsconfig's noUnusedLocals/noUnusedParameters already flag these; keep
      // the `_`-prefix escape hatch consistent between tsc and eslint.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-unused-vars": "off",
    },
  },
  {
    // CommonJS config files (next.config.js) legitimately use require();
    // typescript-eslint's recommended rules otherwise apply to every file.
    files: ["**/*.config.{js,cjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      // Drizzle migrations are the source of truth for the DB shape.
      "lib/db/migrations/**",
    ],
  },
];

export default config;
