"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  sendLinkRequest,
  getMyInvitesRemainingToday,
} from "@/lib/actions/links";
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

/** Mount this only while it is open, so its fields start fresh each time. */
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
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const invitesRemaining = await getMyInvitesRemainingToday();
        if (!isCancelled) {
          setRemaining(invitesRemaining);
        }
      } catch (caughtError) {
        // The server still enforces the limit; only the count is missing.
        console.error("Could not load remaining invites:", caughtError);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  async function handleSend() {
    if (!email.trim()) {
      setError(t("linkContactDialog.emailRequired"));
      return;
    }

    setError(false);
    setIsSubmitting(true);
    const result = await sendLinkRequest(contact.id, email);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      close();
    }
  }

  return (
    <Dialog title={t("linkContactDialog.title")} isOpen={isOpen} close={close}>
      <div className="flex flex-col gap-4">
        <P2 extraClasses="text-grey3">{t("linkContactDialog.intro")}</P2>

        <label className={twMerge(basicLabelClasses, "")}>
          {t("linkContactDialog.friendEmail")}
          <input
            type="email"
            placeholder={t("linkContactDialog.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={twMerge(basicInputClasses, "")}
          />
        </label>

        <P2 extraClasses="text-grey3">{t("linkContactDialog.emailNotice")}</P2>

        {remaining !== null && remaining > 0 && (
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

        {error && <ErrorWarning errorMessage={error} />}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            buttonText={t("common.cancel")}
            onClick={close}
            variant="Secondary"
            disabled={isSubmitting}
          />
          <Button
            buttonText={t("linkContactDialog.sendInvite")}
            onClick={handleSend}
            disabled={isSubmitting || remaining === 0}
          />
        </div>
      </div>
    </Dialog>
  );
}
