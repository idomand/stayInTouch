"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  readConfettiStyle,
  saveConfettiStyle,
  subscribeConfettiStyle,
  CONFETTI_STYLES,
} from "@/lib/confettiStyle";
import { P, P2 } from "@/Components/ui/Text";

/**
 * Per-browser choice of the celebration shown after marking a talk. Default is
 * small.
 */
export default function ConfettiStyleSelector() {
  const t = useTranslations();
  // The server has no localStorage, so it renders "small"; the client then
  // switches to the saved choice without a hydration mismatch.
  const choice = useSyncExternalStore(
    subscribeConfettiStyle,
    readConfettiStyle,
    () => "small",
  );

  return (
    <section className="w-full rounded-[10px] border border-black/10 bg-white p-4 sm:p-6">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend>
          <P extraClasses="text-lg font-semibold mb-2">
            {t("confettiStyleSelector.title")}
          </P>
        </legend>
        <P2 extraClasses="text-grey3">
          {t("confettiStyleSelector.description")}
        </P2>
        {CONFETTI_STYLES.map((style) => (
          <label key={style} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="confettiStyle"
              value={style}
              checked={choice === style}
              onChange={() => saveConfettiStyle(style)}
            />
            <P2>{t(`confettiStyleSelector.${style}`)}</P2>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
