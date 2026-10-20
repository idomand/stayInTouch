"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FaGlobe } from "react-icons/fa";
import type { Locale } from "@/i18n/config";
import { setLocale } from "@/lib/actions/locale";
import { P, P2 } from "@/Components/ui/Text";

export type LanguageChoice = Locale | "auto";

const flagMarkerClasses =
  "inline-flex overflow-hidden rounded-sm ring-1 ring-black/10";

const US_STARS = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => ({
    key: `${row}-${col}`,
    cx: 0.95 + col * 1.43,
    cy: 0.9 + row * 1.75,
  })),
).flat();

/** Inline US flag. Decorative only, so it has no title or aria attributes. */
function UsFlag() {
  return (
    <svg
      width={24}
      height={16}
      viewBox="0 0 19 13"
      preserveAspectRatio="none"
      className="block"
    >
      <rect width="19" height="13" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((y) => (
        <rect key={y} x="0" y={y} width="19" height="1" fill="#FFFFFF" />
      ))}
      <rect x="0" y="0" width="7.6" height="7" fill="#3C3B6E" />
      {US_STARS.map((star) => (
        <circle
          key={star.key}
          cx={star.cx}
          cy={star.cy}
          r={0.35}
          fill="#FFFFFF"
        />
      ))}
    </svg>
  );
}

/** Inline German flag. Decorative only, so it has no title or aria attributes. */
function GermanFlag() {
  return (
    <svg
      width={24}
      height={16}
      viewBox="0 0 5 3"
      preserveAspectRatio="none"
      className="block"
    >
      <rect x="0" y="0" width="5" height="1" fill="#000000" />
      <rect x="0" y="1" width="5" height="1" fill="#DD0000" />
      <rect x="0" y="2" width="5" height="1" fill="#FFCE00" />
    </svg>
  );
}

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
  const t = useTranslations();
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
    <section className="w-full rounded-[10px] border border-black/10 bg-white p-4 sm:p-6">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend>
          <P extraClasses="text-lg font-semibold mb-2">
            {t("languageSelector.title")}
          </P>
        </legend>

        <label key={"auto"} className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="appLanguage"
            value={"auto"}
            checked={choice === "auto"}
            disabled={isPending}
            onChange={() => handleChange("auto")}
          />
          <span
            aria-hidden="true"
            className="inline-flex w-8 shrink-0 justify-center"
          >
            <FaGlobe size={18} className="text-grey3" />
          </span>
          <P2>{t("languageSelector.browserDefault")}</P2>
        </label>

        <label key={"en"} className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="appLanguage"
            value={"en"}
            checked={choice === "en"}
            disabled={isPending}
            onChange={() => handleChange("en")}
          />
          <span
            aria-hidden="true"
            className="inline-flex w-8 shrink-0 justify-center"
          >
            <span className={flagMarkerClasses}>
              <UsFlag />
            </span>
          </span>
          <P2>{t("languageSelector.english")}</P2>
        </label>
        <label key={"de"} className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="appLanguage"
            value={"de"}
            checked={choice === "de"}
            disabled={isPending}
            onChange={() => handleChange("de")}
          />
          <span
            aria-hidden="true"
            className="inline-flex w-8 shrink-0 justify-center"
          >
            <span className={flagMarkerClasses}>
              <GermanFlag />
            </span>
          </span>
          <P2>{t("languageSelector.german")}</P2>
        </label>
      </fieldset>
    </section>
  );
}
