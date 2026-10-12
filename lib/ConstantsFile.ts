/** Longest allowed cadence. Shared by the add/edit forms and the server check. */
export const maxCadenceDays = 60;

/**
 * Invite emails a user may trigger per rolling 24 hours. Enforced in
 * sendLinkRequest; shown in the link dialog.
 */
export const inviteLimitPerDay = 5;
