"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  ANALYTICS_CONSENT_VALUES,
  type AnalyticsConsent,
} from "@/lib/analytics/analyticsConsentCookie";
import {
  readAnalyticsConsent,
  saveAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/lib/analytics/analyticsConsent";
import { P, P2 } from "@/Components/ui/Text";

/**
 * Lets anyone (signed in or not) change the analytics choice made on the banner.
 * Withdrawing must be as easy as accepting. `initialConsent` is the cookie as the
 * server read it, so the first paint is right; with no answer yet, no option is
 * checked (a preselected option is not valid consent).
 */
export default function AnalyticsConsentSelector({
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

  return (
    <section className="w-full rounded-[10px] border border-black/10 bg-white p-4 sm:p-6">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend>
          <P extraClasses="text-lg font-semibold mb-2">
            {t("analyticsConsentSelector.title")}
          </P>
        </legend>
        <P2 extraClasses="text-grey3">
          {t("analyticsConsentSelector.description")}
        </P2>
        {ANALYTICS_CONSENT_VALUES.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="analyticsConsent"
              value={value}
              checked={consent === value}
              onChange={() => saveAnalyticsConsent(value)}
            />
            <P2>{t(`analyticsConsentSelector.${value}`)}</P2>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
