"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { sendLinkRequest, getMyInvitesRemainingToday } from "@/lib/actions/links";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import ErrorWarning from "./ErrorWarning";
import { basicInputClasses, basicLabelClasses } from "./ui/formClasses";
import { twMerge } from "tailwind-merge";
import { P2 } from "./ui/Text";

// Mirrors INVITE_LIMIT_PER_DAY in lib/db/queries/links.ts (a server-only
// module); the server enforces the real limit.
const INVITE_LIMIT_PER_DAY = 3;

export default function LinkContactDialog({
  contact,
  isOpen,
  close,
}: {
  contact: ContactListItem;
  isOpen: boolean;
  close: () => void;
}) {
  const t = useTranslations();
  const [email, setEmail] = useState(contact.friendEmail ?? "");
  const [error, setError] = useState<string | false>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [remaining, setRemaining] = useState<number | null>(null);

  async function handleFormSubmit() {
    if (!email.trim()) {
      setError(t("linkContactDialog.emailRequired"));
      return;
    }

    setIsSubmitting(true);
    const invitesRemaining = await getMyInvitesRemainingToday();
    setIsSubmitting(false);

    setRemaining(invitesRemaining);
    setError(false);
    setStep("confirm");
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    const result = await sendLinkRequest(contact.id, email);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      setStep("form");
    } else {
      setEmail(contact.friendEmail ?? "");
      setStep("form");
      setRemaining(null);
      close();
    }
  }

  function handleDialogClose() {
    setEmail(contact.friendEmail ?? "");
    setError(false);
    setStep("form");
    setRemaining(null);
    close();
  }

  function goBackToForm() {
    setStep("form");
    setRemaining(null);
  }

  return (
    <Dialog
      title={t("linkContactDialog.title")}
      isOpen={isOpen}
      close={handleDialogClose}
    >
      <div className="flex flex-col gap-4">
        {step === "form" && (
          <>
            <P2 extraClasses="text-grey3">
              {t("linkContactDialog.intro")}
            </P2>

            <label className={twMerge(basicLabelClasses, "")}>
              {t("linkContactDialog.friendEmail")}
              <input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={twMerge(basicInputClasses, "")}
              />
            </label>

            {error && <ErrorWarning errorMessage={error} />}

            <div className="flex gap-2 justify-end mt-4">
              <Button
                buttonText={t("common.cancel")}
                onClick={handleDialogClose}
                variant="Secondary"
                disabled={isSubmitting}
              />
              <Button
                buttonText={t("linkContactDialog.continue")}
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        {step === "confirm" && remaining !== null && (
          <>
            <P2 extraClasses="text-grey3">
              {t("linkContactDialog.confirmEmail", { email: email.trim() })}
            </P2>

            {remaining > 0 && (
              <P2 extraClasses="text-grey3">
                {t("linkContactDialog.confirmLimit", {
                  limit: INVITE_LIMIT_PER_DAY,
                  remaining,
                })}
              </P2>
            )}

            {remaining === 0 && (
              <ErrorWarning
                errorMessage={t("linkContactDialog.limitReached", {
                  limit: INVITE_LIMIT_PER_DAY,
                })}
              />
            )}

            <div className="flex gap-2 justify-end mt-4">
              <Button
                buttonText={t("linkContactDialog.back")}
                onClick={goBackToForm}
                variant="Secondary"
                disabled={isSubmitting}
              />
              <Button
                buttonText={t("linkContactDialog.sendInvite")}
                onClick={handleConfirmSubmit}
                disabled={isSubmitting || remaining === 0}
              />
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
