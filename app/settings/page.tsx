import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import DeleteAccountSection from "@/Components/DeleteAccountSection";
import FriendRequests from "@/Components/FriendRequests";
import LanguageSelector from "@/Components/LanguageSelector";
import PendingRequestCountSync from "@/Components/PendingRequestCountSync";
import PageHeader from "@/Components/ui/PageHeader";
import { H4 } from "@/Components/ui/Text";
import { isLocale, LOCALE_COOKIE_NAME } from "@/i18n/config";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  getIncomingRequests,
  getLinkableContacts,
  getOutgoingRequests,
} from "@/lib/db/queries/links";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("settings.title") };
}

/**
 * The settings page: app language, the notifications center (friend requests
 * for now). The NavBar shows logout only on this page. The password section is
 * still planned (see specs/future-upgrades.md).
 */
export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations();
  const savedLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  const [incoming, outgoing, linkableContacts] = await Promise.all([
    getIncomingRequests(),
    getOutgoingRequests(),
    getLinkableContacts(),
  ]);

  return (
    <section className="flex items-center flex-col justify-center gap-4 relative w-[90%] sm:w-[70%] mx-auto mb-8">
      <PageHeader title={t("settings.title")} />
      <LanguageSelector
        savedChoice={isLocale(savedLocale) ? savedLocale : "auto"}
      />
      <H4 extraClasses="self-start mt-2">{t("settings.notifications")}</H4>
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
