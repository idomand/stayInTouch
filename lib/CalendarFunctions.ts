/**
 * Formats a date to Google Calendar URL format (YYYYMMDDTHHmmssZ)
 */
function formatDateForGoogleCalendar(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Opens Google Calendar's "new event" page with the fields filled in. No API
 * call and no token: the user saves the event themselves.
 * @param title - The event title, already translated
 * @param eventDate - The day of the event; it is set to 19:00–20:00 local time
 * @param friendEmail - Added as a guest when given
 */
export function openGoogleCalendarEvent(
  title: string,
  eventDate: Date,
  friendEmail?: string,
): void {
  const startDateTime = new Date(eventDate);
  startDateTime.setHours(19, 0, 0, 0);

  const endDateTime = new Date(eventDate);
  endDateTime.setHours(20, 0, 0, 0);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDateForGoogleCalendar(startDateTime)}/${formatDateForGoogleCalendar(endDateTime)}`,
    add: friendEmail || "",
  });

  window.open(
    `https://calendar.google.com/calendar/render?${params.toString()}`,
    "_blank",
    "width=800,height=600",
  );
}
