"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { H1 } from "@/Components/ui/Text";
import Button from "./ui/Button";

export default function MainForm() {
  const { currentUser } = useAuth()!;
  const t = useTranslations();
  const [showMainForm, setShowMainForm] = useState(false);
  const displayName = currentUser?.displayName;

  return (
    <>
      <section className="mx-5 mt-1 flex flex-wrap items-center gap-2 sm:mt-0 sm:mr-0 sm:ml-5 sm:block">
        <div className="flex w-full justify-between">
          <H1 extraClasses="pt-2.5 min-w-0 break-words">
            {displayName
              ? t("mainForm.greeting", { name: displayName })
              : t("mainForm.greetingNoName")}
          </H1>
        </div>
        <div className="mx-auto mb-3 sm:mx-0 sm:mb-0">
          <Button
            buttonText={t("mainForm.makeAFriend")}
            onClick={() => setShowMainForm(!showMainForm)}
          />
        </div>
      </section>
      {showMainForm && <AddNewContact />}
    </>
  );
}
