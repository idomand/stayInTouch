"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { setOverdueReminders } from "@/lib/actions/settings";
import { overdueReminderDelayHours } from "@/lib/ConstantsFile";
import { P, P2 } from "@/Components/ui/Text";
import ErrorWarning from "@/Components/ui/ErrorWarning";

/**
 * Email notification choices, saved on the account. The id lets the link in a
 * reminder email jump here (/settings#notifications).
 */
export default function NotificationSettings({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const t = useTranslations();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextEnabled: boolean) {
    setError(null);
    setEnabled(nextEnabled);
    startTransition(async () => {
      try {
        const result = await setOverdueReminders(nextEnabled);
        if (!result.ok) {
          setEnabled(!nextEnabled);
          setError(result.error);
        }
      } catch (caughtError) {
        console.error("Could not save the notification setting:", caughtError);
        setEnabled(!nextEnabled);
        setError(t("notificationSettings.saveFailed"));
      }
    });
  }

  return (
    <section
      id="notifications"
      className="w-full scroll-mt-4 rounded-[10px] border border-black/10 bg-white p-4 sm:p-6"
    >
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend>
          <P extraClasses="text-lg font-semibold mb-2">
            {t("notificationSettings.title")}
          </P>
        </legend>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <P2>
            {t("notificationSettings.overdueReminders", {
              hours: overdueReminderDelayHours,
            })}
          </P2>
          {/* A native checkbox drawn as a switch: the label, keyboard and
              screen readers keep working, and role="switch" reads it as on/off. */}
          <span className="relative inline-flex shrink-0">
            <input
              type="checkbox"
              role="switch"
              name="overdueReminders"
              className="peer sr-only"
              checked={enabled}
              disabled={isPending}
              onChange={(event) => handleChange(event.target.checked)}
            />
            <span
              aria-hidden="true"
              className="bg-grey1 peer-checked:bg-blue1 peer-focus-visible:outline-blue1 h-6 w-11 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:opacity-60 motion-reduce:transition-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 motion-reduce:transition-none"
            />
          </span>
        </label>
        <P2 extraClasses="text-grey3">
          {t("notificationSettings.description")}
        </P2>
        {error && <ErrorWarning errorMessage={error} />}
      </fieldset>
    </section>
  );
}
