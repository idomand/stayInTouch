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
      <section className="flex items-center flex-wrap gap-2 mt-1 mx-5 sm:block sm:ml-5 sm:mt-0 sm:mr-0">
        <div className="flex justify-between w-full">
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
