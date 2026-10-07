import "server-only";
import { Resend } from "resend";

/**
 * Outbound email (Resend). Fail fast at module load when configuration is
 * missing, same contract as lib/db/index.ts and lib/firebaseAdmin.ts.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local and to the Vercel project settings.`,
    );
  }
  return value;
}

export const resend = new Resend(requireEnv("RESEND_API_KEY"));

/** Signs unsubscribe links; see unsubscribeToken.ts. */
export const unsubscribeSecret = requireEnv("EMAIL_UNSUBSCRIBE_SECRET");

/** Base for links in emails: http://localhost:3000 in dev, the site in prod. */
export const appUrl = requireEnv("APP_URL").replace(/\/+$/, "");
