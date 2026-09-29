import "server-only";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local and to the Vercel project settings.",
  );
}

// Reuse the pool across dev hot reloads; a new Pool per reload leaks connections.
// The URL is cached with it: after DATABASE_URL changes, a reused pool would
// keep writing to the old database (e.g. production instead of the dev branch).
const globalForDb = globalThis as unknown as { pool?: Pool; poolUrl?: string };
if (globalForDb.pool && globalForDb.poolUrl !== connectionString) {
  globalForDb.pool.end().catch((error) => {
    console.error("Failed to close the stale database pool:", error);
  });
  globalForDb.pool = undefined;
}
const pool = globalForDb.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.poolUrl = connectionString;
}

/**
 * The single Neon Postgres client for the whole app. Import this; never build
 * another client. Uses the WebSocket driver because the HTTP driver cannot run
 * interactive transactions.
 */
export const db = drizzle({ client: pool });
