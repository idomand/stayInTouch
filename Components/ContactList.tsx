import { H1, P3 } from "@/Components/ui/Text";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import ContactItem from "./ContactItem";

/**
 * Renders the server-fetched contact list. The rows arrive already ordered
 * (most overdue and never-talked first) from the read query, so there is no
 * client-side sort. A new account starts empty — a case the Firestore model,
 * which always seeded demo contacts, never had to render.
 */
export default function ContactList({
  contacts,
}: {
  contacts: ContactListItem[];
}) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center mt-10 text-center gap-2">
        <H1>No contacts yet</H1>
        <P3>Add your first friend with “Make a friend!” above.</P3>
      </div>
    );
  }

  return (
    <ul className="p-0 flex flex-col items-center relative">
      {contacts.map((contact) => (
        <ContactItem key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}
