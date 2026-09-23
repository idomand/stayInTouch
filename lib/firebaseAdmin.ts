import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK — server-only. This is the counterpart to the client
 * `lib/Firebase.ts`: it verifies identity on the server so Server Components and
 * Server Actions can know the uid that fills `owner_id` in Postgres.
 *
 * Credentials come from a base64-encoded service-account JSON in
 * FIREBASE_SERVICE_ACCOUNT_B64 (base64 avoids the `\n`-in-private_key env pain).
 * Fail fast at module load if it is missing, same contract as lib/db/index.ts.
 */
const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
if (!serviceAccountB64) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_B64 is not set. Add the base64-encoded service-account JSON to .env.local and to the Vercel project settings.",
  );
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountB64, "base64").toString("utf8"),
);

// Reuse the app across hot reloads and serverless invocations; initializeApp
// throws if called twice for the default app.
const app: App = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

export const adminAuth = getAuth(app);
