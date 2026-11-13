"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { AnalyticsConsent } from "@/lib/analytics/analyticsConsentCookie";
import {
  readAnalyticsConsent,
  saveAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/lib/analytics/analyticsConsent";
import Button from "@/Components/ui/Button";
import Link from "@/Components/ui/Link";
import { P2 } from "@/Components/ui/Text";

function privacyLink(chunks: ReactNode) {
  return (
    <Link href="/privacy" variant="Text">
      {chunks}
    </Link>
  );
}

/**
 * Asks once for analytics consent and hides after any answer. `initialConsent`
 * is the cookie as the server read it; React uses it for the server HTML and
 * for hydration, so the first paint is already right.
 */
export default function AnalyticsConsentBanner({
  initialConsent,
}: {
  initialConsent: AnalyticsConsent | null;
}) {
  const t = useTranslations();
  const consent = useSyncExternalStore(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    () => initialConsent,
  );

  if (consent !== null) {
    return null;
  }

  return (
    <section
      aria-label={t("analyticsConsentBanner.label")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
        <P2 extraClasses="flex-1">
          {t.rich("analyticsConsentBanner.text", { link: privacyLink })}
        </P2>
        {/* Same variant on purpose: declining must be as easy as accepting. */}
        <div className="flex gap-2">
          <Button
            buttonText={t("analyticsConsentBanner.decline")}
            onClick={() => saveAnalyticsConsent("denied")}
            extraClasses="flex-1 sm:flex-none"
          />
          <Button
            buttonText={t("analyticsConsentBanner.accept")}
            onClick={() => saveAnalyticsConsent("granted")}
            extraClasses="flex-1 sm:flex-none"
          />
        </div>
      </div>
    </section>
  );
}
