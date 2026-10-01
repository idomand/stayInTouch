"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { P, P2 } from "./ui/Text";
import { basicInputClasses } from "./ui/formClasses";

/**
 * App language picker. UI only for now: the choice is kept in local state and
 * changes nothing — translations are not built yet.
 */
export default function LanguageSelector() {
  const [language, setLanguage] = useState("en");

  return (
    <section className="bg-white rounded-[10px] border border-black/10 p-4 sm:p-6 w-full">
      <label htmlFor="app-language">
        <P extraClasses="text-lg font-semibold mb-2">App language</P>
      </label>
      <select
        id="app-language"
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value);
        }}
        className={twMerge(basicInputClasses, "px-3 w-full sm:w-60")}
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>
      <P2 extraClasses="text-grey3 mt-2">More languages are coming soon.</P2>
    </section>
  );
}
