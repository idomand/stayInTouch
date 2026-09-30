"use client";
import { useState } from "react";
import { sendLinkRequest } from "@/lib/actions/links";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import ErrorWarning from "./ErrorWarning";
import { basicInputClasses, basicLabelClasses } from "./ui/formClasses";
import { twMerge } from "tailwind-merge";
import { P2 } from "./ui/Text";

export default function LinkContactDialog({
  contact,
  isOpen,
  close,
}: {
  contact: ContactListItem;
  isOpen: boolean;
  close: () => void;
}) {
  const [email, setEmail] = useState(contact.friendEmail ?? "");
  const [error, setError] = useState<string | false>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    setIsSubmitting(true);
    const result = await sendLinkRequest(contact.id, email);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setEmail(contact.friendEmail ?? "");
      close();
    }
  }

  function handleDialogClose() {
    setEmail(contact.friendEmail ?? "");
    setError(false);
    close();
  }

  return (
    <Dialog
      title="Link with a friend"
      isOpen={isOpen}
      close={handleDialogClose}
    >
      <div className="flex flex-col gap-4">
        <P2 extraClasses="text-grey3">
          Send a request to your friend's Stay-in-Touch email. When they
          accept, a talk marked by either of you resets both timers.
        </P2>

        <label className={twMerge(basicLabelClasses, "")}>
          Friend's email
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
            buttonText="Cancel"
            onClick={handleDialogClose}
            variant="Secondary"
            disabled={isSubmitting}
          />
          <Button
            buttonText="Send request"
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Dialog>
  );
}
