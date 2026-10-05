"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { showArt } from "./SecretGame";
import { H1 } from "@/Components/ui/Text";
import Button from "./ui/Button";

export default function MainForm() {
  const { currentUser } = useAuth()!;
  const t = useTranslations();
  const [hiddenGameIndicator, setHiddenGameIndicator] = useState(false);
  const [showMainForm, setShowMainForm] = useState(false);

  function startGame() {
    setHiddenGameIndicator((value) => !value);
    showArt();
  }

  return (
    <>
      <section className="flex items-center flex-wrap gap-2 mt-1 mx-5 sm:block sm:ml-5 sm:mt-0 sm:mr-0">
        <div className="flex justify-between w-full">
          <H1 extraClasses="pt-2.5 min-w-0 break-words">
            <span
              onClick={startGame}
              className={`cursor-pointer ${
                hiddenGameIndicator ? "text-red1" : "text-black"
              }`}
            >
              {t("mainForm.hi")}
            </span>{" "}
            {currentUser?.displayName}
          </H1>
        </div>
        <div>
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
