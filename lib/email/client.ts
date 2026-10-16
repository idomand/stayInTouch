import "server-only";
import { Resend } from "resend";
import { escapeHtml } from "./escapeHtml";

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

/**
 * The app icon at the top of every HTML email. A hosted image, not an
 * attachment: some clients hide it until the reader allows images, and then
 * the alt text shows. In dev it points at localhost, so it loads only there.
 */
export const emailLogoHtml = `<p><img src="${escapeHtml(`${appUrl}/favicon-32x32.png`)}" width="32" height="32" alt="Stay-in-Touch" style="display:block;border:0"></p>`;
