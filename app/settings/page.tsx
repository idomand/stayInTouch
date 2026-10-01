import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FriendRequests from "@/Components/FriendRequests";
import LanguageSelector from "@/Components/LanguageSelector";
import PageHeader from "@/Components/ui/PageHeader";
import { H4 } from "@/Components/ui/Text";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  getIncomingRequests,
  getLinkableContacts,
  getOutgoingRequests,
} from "@/lib/db/queries/links";

export const metadata: Metadata = {
  title: "Settings | Stay-in-Touch",
};

/**
 * The settings page: app language (UI only, not wired yet), the notifications
 * center (friend requests for now). The NavBar shows logout only on this page.
 * The password section is still planned (see specs/future-upgrades.md).
 */
export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const [incoming, outgoing, linkableContacts] = await Promise.all([
    getIncomingRequests(),
    getOutgoingRequests(),
    getLinkableContacts(),
  ]);

  return (
    <section className="flex items-center flex-col justify-center gap-4 relative w-[90%] sm:w-[70%] mx-auto mb-8">
      <PageHeader title="Settings" />
      <LanguageSelector />
      <H4 extraClasses="self-start mt-2">Notifications</H4>
      <FriendRequests
        incoming={incoming}
        outgoing={outgoing}
        linkableContacts={linkableContacts}
      />
    </section>
  );
}
