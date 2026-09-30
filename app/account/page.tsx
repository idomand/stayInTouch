import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FriendRequests from "@/Components/FriendRequests";
import PageHeader from "@/Components/ui/PageHeader";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  getIncomingRequests,
  getLinkableContacts,
  getOutgoingRequests,
} from "@/lib/db/queries/links";

export const metadata: Metadata = {
  title: "Account | Stay-in-Touch",
};

/**
 * The account page. Phase 8 builds only the "Friend requests" section; the
 * notifications, password and language sections are planned (see "Future
 * upgrades" in specs/postgres-migration.md).
 */
export default async function AccountPage() {
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
    <section className="flex items-center flex-col justify-center relative w-[90%] sm:w-[70%] mx-auto">
      <PageHeader title="Account" />
      <FriendRequests
        incoming={incoming}
        outgoing={outgoing}
        linkableContacts={linkableContacts}
      />
    </section>
  );
}
