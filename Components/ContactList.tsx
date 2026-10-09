import { useTranslations } from "next-intl";
import { H2, P3 } from "@/Components/ui/Text";
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
  const t = useTranslations();

  if (contacts.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-2 text-center">
        <H2>{t("contactList.empty")}</H2>
        <P3>{t("contactList.emptyHint")}</P3>
      </div>
    );
  }

  return (
    <ul className="relative flex flex-col items-center p-0">
      {contacts.map((contact) => (
        <ContactItem key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}
