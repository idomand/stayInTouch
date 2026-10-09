"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { P, P2 } from "./ui/Text";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

export default function DeleteAccountSection() {
  const t = useTranslations();
  const auth = useAuth()!;
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (!isDeleting) {
      setIsOpen(false);
      setError(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      const result = await auth.deleteAccount();
      if (!result.ok) {
        setError(result.error);
        setIsDeleting(false);
      }
    } catch (caughtError) {
      console.error("Could not delete account:", caughtError);
      setError(t("deleteAccount.failed"));
      setIsDeleting(false);
    }
  }

  return (
    <section className="bg-white rounded-[10px] border border-black/10 p-4 sm:p-6 w-full">
      <div>
        <P extraClasses="text-lg font-semibold mb-2">{t("deleteAccount.title")}</P>
        <P2 extraClasses="text-grey3 mb-4">{t("deleteAccount.intro")}</P2>
      </div>

      <Button
        buttonText={t("deleteAccount.open")}
        onClick={() => setIsOpen(true)}
        variant="Danger"
      />

      <Dialog title={t("deleteAccount.dialogTitle")} isOpen={isOpen} close={handleClose}>
        <div className="flex flex-col gap-4">
          <P2>{t("deleteAccount.whatIsDeleted")}</P2>
          <P2 extraClasses="text-grey3">{t("deleteAccount.friendsKeep")}</P2>
          <P2 extraClasses="font-semibold">{t("deleteAccount.cannotUndo")}</P2>
          {error && <P2 extraClasses="text-red1">{error}</P2>}
          <div className="flex gap-2 justify-end mt-4">
            <Button
              buttonText={t("common.cancel")}
              onClick={handleClose}
              variant="Secondary"
              disabled={isDeleting}
            />
            <Button
              buttonText={isDeleting ? t("deleteAccount.deleting") : t("deleteAccount.confirm")}
              onClick={handleDelete}
              variant="Danger"
              disabled={isDeleting}
            />
          </div>
        </div>
      </Dialog>
    </section>
  );
}
