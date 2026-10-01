"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/config";
import { setLocale } from "@/lib/actions/locale";
import { P } from "./ui/Text";
import { basicInputClasses } from "./ui/formClasses";

export type LanguageChoice = Locale | "auto";

/**
 * App language picker. "auto" follows the browser's language; English and
 * Deutsch are saved in a cookie for this browser. Language names are written
 * in their own language so a user can find theirs whatever is showing.
 */
export default function LanguageSelector({
  savedChoice,
}: {
  savedChoice: LanguageChoice;
}) {
  const t = useTranslations("LanguageSelector");
  const [choice, setChoice] = useState<LanguageChoice>(savedChoice);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextChoice: LanguageChoice) {
    const previousChoice = choice;
    setChoice(nextChoice);
    startTransition(async () => {
      try {
        await setLocale(nextChoice);
      } catch (error) {
        console.error("Could not change the language:", error);
        setChoice(previousChoice);
      }
    });
  }

  return (
    <section className="bg-white rounded-[10px] border border-black/10 p-4 sm:p-6 w-full">
      <label htmlFor="app-language">
        <P extraClasses="text-lg font-semibold mb-2">{t("title")}</P>
      </label>
      <select
        id="app-language"
        value={choice}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as LanguageChoice)}
        className={twMerge(basicInputClasses, "px-3 w-full sm:w-60")}
      >
        <option value="auto">{t("browserDefault")}</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>
    </section>
  );
}
