import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import ApiTokens from "@/Components/settings/ApiTokens";
import LanguageSelector from "@/Components/settings/LanguageSelector";
import NotificationSettings from "@/Components/settings/NotificationSettings";
import ConfettiStyleSelector from "@/Components/settings/ConfettiStyleSelector";
import AnalyticsConsentSelector from "@/Components/settings/AnalyticsConsentSelector";
import PageHeader from "@/Components/ui/PageHeader";
import { isLocale, APP_LANGUAGE_COOKIE } from "@/i18n/config";
import {
  ANALYTICS_CONSENT_COOKIE,
  isAnalyticsConsent,
} from "@/lib/analytics/analyticsConsentCookie";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getApiTokens } from "@/lib/db/queries/apiTokens";
import { getOverdueRemindersEnabled } from "@/lib/db/queries/settings";
import { appUrl } from "@/lib/email/client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("settings.title") };
}

/**
 * The settings page: app language and the analytics choice, shown to
 * everyone like the language, plus the confetti style, email notifications
 * and access tokens for AI agents for signed-in users. Public, so a visitor
 * can pick the language before signing in. Account features live on /profile.
 */
export default async function SettingsPage() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get(APP_LANGUAGE_COOKIE)?.value;
  const savedConsent = cookieStore.get(ANALYTICS_CONSENT_COOKIE)?.value;
  const user = await getServerUser();

  return (
    <section className="relative mx-auto mb-8 flex w-[90%] flex-col items-center justify-center gap-4 sm:w-[70%]">
      <PageHeader title={t("settings.title")} />
      <LanguageSelector
        savedChoice={isLocale(savedLocale) ? savedLocale : "auto"}
      />
      <AnalyticsConsentSelector
        initialConsent={isAnalyticsConsent(savedConsent) ? savedConsent : null}
      />
      {user && <ConfettiStyleSelector />}
      {user && (
        <NotificationSettings
          initialEnabled={await getOverdueRemindersEnabled(user.uid)}
        />
      )}
      {user && (
        <ApiTokens
          initialTokens={await getApiTokens(user.uid)}
          mcpUrl={`${appUrl}/api/mcp`}
        />
      )}
    </section>
  );
}
