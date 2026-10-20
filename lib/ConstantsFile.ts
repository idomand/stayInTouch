/** Longest allowed cadence. Shared by the add/edit forms and the server check. */
export const maxCadenceDays = 60;

/**
 * Longest allowed name: contact names and the sign-up display name. Shared by
 * the forms (maxLength and the characters-left counter) and the server checks.
 */
export const maxNameLength = 50;

/**
 * Invite emails a user may trigger per rolling 24 hours. Enforced in
 * sendLinkRequest; shown in the link dialog.
 */
export const inviteLimitPerDay = 5;

/**
 * Hours a contact stays red before its overdue reminder email is due. Used by
 * the daily job and shown in the FAQ.
 */
export const overdueReminderDelayHours = 24;

/**
 * Most MCP access tokens one user may hold at once. Enforced in createApiToken;
 * shown on /settings.
 */
export const maxApiTokensPerUser = 5;
