"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  readTalkEffect,
  saveTalkEffect,
  subscribeTalkEffect,
  TALK_EFFECTS,
} from "@/lib/talkEffect";
import { P, P2 } from "./ui/Text";

/**
 * Per-browser choice of the celebration shown after marking a talk. Default is
 * small.
 */
export default function TalkEffectSelector() {
  const t = useTranslations();
  // The server has no localStorage, so it renders "small"; the client then
  // switches to the saved choice without a hydration mismatch.
  const choice = useSyncExternalStore(
    subscribeTalkEffect,
    readTalkEffect,
    () => "small",
  );

  return (
    <section className="w-full rounded-[10px] border border-black/10 bg-white p-4 sm:p-6">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend>
          <P extraClasses="text-lg font-semibold mb-2">
            {t("talkEffectSelector.title")}
          </P>
        </legend>
        <P2 extraClasses="text-grey3">{t("talkEffectSelector.description")}</P2>
        {TALK_EFFECTS.map((effect) => (
          <label
            key={effect}
            className="flex cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              name="talkEffect"
              value={effect}
              checked={choice === effect}
              onChange={() => saveTalkEffect(effect)}
            />
            <P2>{t(`talkEffectSelector.${effect}`)}</P2>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
