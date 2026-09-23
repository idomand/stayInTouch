/**
 * Session-cookie constants shared by the route handler that mints the cookie
 * and the helper that reads it. One source of truth for the name and lifetime,
 * so the two sides cannot drift apart.
 */
export const SESSION_COOKIE_NAME = "session";

/** Firebase session cookies may last up to 14 days; 5 is a safe default. */
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000;
