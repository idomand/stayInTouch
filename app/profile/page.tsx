import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import DeleteAccountSection from "@/Components/settings/DeleteAccountSection";
import FriendRequests from "@/Components/links/FriendRequests";
import PendingRequestCountSync from "@/Components/links/PendingRequestCountSync";
import PageHeader from "@/Components/ui/PageHeader";
import { H4 } from "@/Components/ui/Text";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  getIncomingRequests,
  getLinkableContacts,
  getOutgoingRequests,
} from "@/lib/db/queries/links";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("profile.title") };
}

/**
 * The profile page: the notifications center (friend requests for now) and
 * account deletion. The NavBar shows logout only on this page. The password
 * section is still planned (see specs/future-upgrades.md).
 */
export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations();
  const [incoming, outgoing, linkableContacts] = await Promise.all([
    getIncomingRequests(),
    getOutgoingRequests(),
    getLinkableContacts(),
  ]);

  return (
    <section className="relative mx-auto mb-8 flex w-[90%] flex-col items-center justify-center gap-4 sm:w-[70%]">
      <PageHeader title={t("profile.title")} />
      <H4 extraClasses="self-start mt-2">{t("profile.notifications")}</H4>
      <PendingRequestCountSync count={incoming.length} />
      <FriendRequests
        incoming={incoming}
        outgoing={outgoing}
        linkableContacts={linkableContacts}
      />
      <DeleteAccountSection />
    </section>
  );
}
