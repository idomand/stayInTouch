import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import LanguageSelector from "@/Components/settings/LanguageSelector";
import NotificationSettings from "@/Components/settings/NotificationSettings";
import TalkEffectSelector from "@/Components/settings/TalkEffectSelector";
import PageHeader from "@/Components/ui/PageHeader";
import { isLocale, LOCALE_COOKIE_NAME } from "@/i18n/config";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getOverdueRemindersEnabled } from "@/lib/db/queries/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("settings.title") };
}

/**
 * The settings page: app language, plus the talk effect and email
 * notifications for signed-in users.
 * Public, so a visitor can pick the language before signing in. Account
 * features live on /profile.
 */
export default async function SettingsPage() {
  const t = await getTranslations();
  const savedLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  const user = await getServerUser();

  return (
    <section className="relative mx-auto mb-8 flex w-[90%] flex-col items-center justify-center gap-4 sm:w-[70%]">
      <PageHeader title={t("settings.title")} />
      <LanguageSelector
        savedChoice={isLocale(savedLocale) ? savedLocale : "auto"}
      />
      {user && <TalkEffectSelector />}
      {user && (
        <NotificationSettings
          initialEnabled={await getOverdueRemindersEnabled(user.uid)}
        />
      )}
    </section>
  );
}
