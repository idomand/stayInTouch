import { auth } from "./Firebase";

let cachedAccessToken: string | null = null;

/**
 * Sets the Google OAuth access token for API calls
 * This should be called after successful Google sign-in
 */
export function setGoogleAccessToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Gets the stored Google OAuth access token
 */
function getGoogleAccessToken(): string | null {
  // Try to get from cache first
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  // Fall back to localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("googleAccessToken");
  }
  return null;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

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
 * Opens Google Calendar dialog with pre-filled event details
 * @param eventName - The name/summary of the event
 * @param eventDate - The date for the event (defaults to today)
 * @param description - Optional description for the event
 * @returns Promise with success status
 */
export async function createGoogleCalendarEvent(
  eventName: string,
  eventDate: Date = new Date(),
  description?: string
): Promise<any> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const userName = user?.displayName?.split(" ")[0];

    // Set the event to be at a specific time
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(10, 0, 0, 0); // Set to 10:00 AM

    const endDateTime = new Date(eventDate);
    endDateTime.setHours(11, 0, 0, 0); // Set to 11:00 AM (1 hour duration)

    // Format dates for Google Calendar URL
    const startFormatted = formatDateForGoogleCalendar(startDateTime);
    const endFormatted = formatDateForGoogleCalendar(endDateTime);

    // Build Google Calendar URL with pre-filled event details
    // Note: The URL template method doesn't support setting colors
    // Colors can only be set via the Calendar API after the event is created
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${eventName} - ${userName}`,
      dates: `${startFormatted}/${endFormatted}`,
      details: description || "",
      //   add: "idomand@google.com", // Add guest/attendee
    });

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

    // Open Google Calendar in a new window
    window.open(calendarUrl, "_blank", "width=800,height=600");

    return {
      success: true,
      message: "Google Calendar opened",
    };
  } catch (error: any) {
    console.error("Error opening calendar:", error);
    return {
      success: false,
      error: error.message || "Failed to open calendar",
    };
  }
}

/**
 * Creates a reminder event for a contact
 * @param contactName - The name of the contact
 * @param reminderDate - The date to set the reminder
 * @returns Promise with the created event or error
 */
export async function createContactReminderEvent(
  contactName: string,
  reminderDate: Date
): Promise<any> {
  const eventName = `Call ${contactName}`;
  const description = `Reminder to reach out to ${contactName}`;

  return createGoogleCalendarEvent(eventName, reminderDate, description);
}
