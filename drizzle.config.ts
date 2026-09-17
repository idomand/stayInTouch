import type { Config } from "drizzle-kit";

// drizzle-kit loads .env automatically but not .env.local, which is the only
// env file this repo uses.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Not present in CI; the shell is expected to provide DATABASE_URL there.
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local.");
}

export default {
  dialect: "postgresql",
  schema: "./lib/db/schema",
  out: "./lib/db/migrations",
  dbCredentials: { url },
} satisfies Config;
