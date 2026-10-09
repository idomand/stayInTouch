"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { acceptLinkRequest } from "@/lib/actions/links";
import { maxCadenceDays } from "@/lib/ConstantsFile";
import type {
  IncomingLinkRequest,
  LinkableContact,
} from "@/lib/db/queries/links";
import { P2 } from "./ui/Text";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import ErrorWarning from "./ErrorWarning";
import { basicInputClasses, basicLabelClasses } from "./ui/formClasses";
import { twMerge } from "tailwind-merge";

export default function AcceptLinkDialog({
  request,
  linkableContacts,
  isOpen,
  close,
}: {
  request: IncomingLinkRequest;
  linkableContacts: LinkableContact[];
  isOpen: boolean;
  close: () => void;
}) {
  const t = useTranslations();
  const [choice, setChoice] = useState<"existing" | "new">(
    linkableContacts.length > 0 ? "existing" : "new",
  );
  const [selectedContactId, setSelectedContactId] = useState(
    linkableContacts.length > 0 ? linkableContacts[0]?.id : "",
  );
  const [newContactName, setNewContactName] = useState(request.fromName);
  // A string, so the field can be emptied while typing; checked on submit.
  const [newContactCadence, setNewContactCadence] = useState("7");
  const [error, setError] = useState<string | false>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (choice === "existing" && !selectedContactId) {
      setError(t("acceptLinkDialog.selectContactError"));
      return;
    }
    if (choice === "new" && !newContactName.trim()) {
      setError(t("acceptLinkDialog.nameRequiredError"));
      return;
    }

    setError(false);
    setIsSubmitting(true);
    const target =
      choice === "existing"
        ? { contactId: selectedContactId }
        : {
            newContact: {
              name: newContactName,
              cadenceDays: Number(newContactCadence),
            },
          };

    const result = await acceptLinkRequest(request.id, target);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      close();
    }
  }

  function resetForm() {
    setChoice(linkableContacts.length > 0 ? "existing" : "new");
    setSelectedContactId(
      linkableContacts.length > 0 ? (linkableContacts[0]?.id ?? "") : "",
    );
    setNewContactName(request.fromName);
    setNewContactCadence("7");
    setError(false);
  }

  function handleDialogClose() {
    resetForm();
    close();
  }

  return (
    <Dialog
      title={t("acceptLinkDialog.title", { name: request.fromName })}
      isOpen={isOpen}
      close={handleDialogClose}
    >
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <legend className="p-0 mb-4 text-sm text-grey3">
            {t("acceptLinkDialog.question", { name: request.fromName })}
          </legend>

          {/* Radio: Existing contact */}
          <div className="flex items-start gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="choice"
                value="existing"
                checked={choice === "existing"}
                onChange={() => setChoice("existing")}
                className="mt-1"
              />
              <P2 extraClasses="font-medium">
                {t("acceptLinkDialog.existingContact")}
              </P2>
            </label>
            <div className="flex-1">
              {linkableContacts.length === 0 ? (
                <P2 extraClasses="text-grey3 text-xs mt-1">
                  {t("acceptLinkDialog.noUnlinkedContacts")}
                </P2>
              ) : (
                <select
                  aria-label={t("acceptLinkDialog.selectExisting")}
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  disabled={choice !== "existing"}
                  className={twMerge(
                    basicInputClasses,
                    "mt-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {linkableContacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Radio: New contact */}
          <div className="flex items-start gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="choice"
                value="new"
                checked={choice === "new"}
                onChange={() => setChoice("new")}
                className="mt-1"
              />
              <P2 extraClasses="font-medium">
                {t("acceptLinkDialog.newContact")}
              </P2>
            </label>
            <div className="flex-1">
              <div className="mt-2 space-y-2">
                <input
                  aria-label={t("acceptLinkDialog.contactName")}
                  type="text"
                  placeholder={t("acceptLinkDialog.contactName")}
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  disabled={choice !== "new"}
                  className={twMerge(
                    basicInputClasses,
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                />
                <div className={twMerge(basicLabelClasses, "")}>
                  <span className="text-xs text-grey3">
                    {t("acceptLinkDialog.everyXDays")}
                  </span>
                  <input
                    aria-label={t("acceptLinkDialog.cadenceLabel")}
                    type="number"
                    min={1}
                    max={maxCadenceDays}
                    value={newContactCadence}
                    onChange={(e) => setNewContactCadence(e.target.value)}
                    disabled={choice !== "new"}
                    className={twMerge(
                      basicInputClasses,
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {error && <ErrorWarning errorMessage={error} />}

        <div className="flex gap-2 justify-end mt-4">
          <Button
            buttonText={t("common.cancel")}
            onClick={handleDialogClose}
            variant="Secondary"
            disabled={isSubmitting}
          />
          <Button
            buttonText={t("common.accept")}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Dialog>
  );
}
