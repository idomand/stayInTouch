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
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool = globalForDb.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

/**
 * The single Neon Postgres client for the whole app. Import this; never build
 * another client. Uses the WebSocket driver because the HTTP driver cannot run
 * interactive transactions.
 */
export const db = drizzle({ client: pool });
