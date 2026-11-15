"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
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
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  // Focus, not a page-wide key listener: Enter accepts only while focus is
  // still here. A listener would also catch Enter in a form on the page and
  // grant consent by accident, which is not valid consent.
  useEffect(() => {
    if (consent === null) {
      acceptButtonRef.current?.focus();
    }
  }, [consent]);

  if (consent !== null) {
    return null;
  }

  return (
    <section
      aria-label={t("analyticsConsentBanner.label")}
      className="border-grey1 border-l-blue1 fixed inset-x-4 top-1/3 z-50 mx-auto max-w-3xl rounded-xl border border-l-4 bg-gray-300 p-5 shadow-2xl sm:p-6"
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
            ref={acceptButtonRef}
            buttonText={t("analyticsConsentBanner.accept")}
            onClick={() => saveAnalyticsConsent("granted")}
            extraClasses="flex-1 sm:flex-none"
          />
        </div>
      </div>
    </section>
  );
}
