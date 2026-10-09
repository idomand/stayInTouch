"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { updateContact } from "@/lib/actions/contacts";
import { maxCadenceDays } from "@/lib/ConstantsFile";
import {
  basicFormClasses,
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import ErrorWarning from "./ErrorWarning";
import Dialog from "./ui/Dialog";

type UpdateContactFormProps = {
  contact: ContactListItem;
  isModalOpenProp: boolean;
  onClose: () => void;
};

/**
 * Mount this only while it is open: its fields start from the contact as it
 * is now, so every open shows current data.
 */
export default function UpdateContactForm({
  contact,
  isModalOpenProp,
  onClose,
}: UpdateContactFormProps) {
  const t = useTranslations();
  const [contactName, setContactName] = useState(contact.name);
  const [newFriendEmail, setNewFriendEmail] = useState(
    contact.friendEmail ?? "",
  );
  // A string, so the field can be emptied while typing; checked on submit.
  const [contactTime, setContactTime] = useState(String(contact.cadenceDays));
  const [error, setError] = useState<string | false>(false);

  async function updateContactOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    const nameChanged = contactName !== contact.name;
    const cadenceChanged = Number(contactTime) !== contact.cadenceDays;
    const emailChanged = newFriendEmail !== (contact.friendEmail ?? "");

    if (!nameChanged && !cadenceChanged && !emailChanged) {
      onClose();
      return;
    }

    const result = await updateContact(contact.id, {
      name: contactName,
      cadenceDays: Number(contactTime),
      friendEmail: newFriendEmail,
    });

    if (!result.ok) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  function timeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactTime(e.target.value);
  }

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  return (
    <Dialog
      title={t("updateContactForm.title", { name: contact.name })}
      isOpen={isModalOpenProp}
      close={onClose}
    >
      <section className="flex flex-col justify-center sm:flex-row">
        <div>
          <form
            onSubmit={updateContactOnSubmit}
            className={twMerge(
              basicFormClasses,
              "m-0 gap-1 rounded-none p-2.5 sm:m-2.5 sm:gap-7.5 sm:p-3.5",
            )}
          >
            <label className={twMerge(basicLabelClasses, "")}>
              {t("updateContactForm.changeName")}
              <input
                type="text"
                placeholder={t("common.enterName")}
                name="name"
                value={contactName}
                required
                onChange={nameChangeHandler}
                className={twMerge(
                  basicInputClasses,
                  "border-grey2 border border-solid p-1",
                )}
              />
            </label>
            <label
              className={twMerge(
                basicLabelClasses,
                "after:text-grey3 relative after:absolute after:top-8 after:left-5 after:text-[10px] after:font-bold after:content-(--days-label)",
              )}
              // CSS content needs a quoted string; the variable carries the
              // translated "Days" into the ::after label.
              style={
                {
                  "--days-label": JSON.stringify(t("common.days")),
                } as React.CSSProperties
              }
            >
              {t("updateContactForm.changeCadence")}
              <input
                type="number"
                name="time"
                required
                max={maxCadenceDays}
                min={1}
                value={contactTime}
                onChange={timeChangeHandler}
                className={twMerge(
                  basicInputClasses,
                  "border-grey2 rounded-lg border border-solid",
                )}
              />
            </label>
            <label className={twMerge(basicLabelClasses, "")}>
              {t("updateContactForm.changeEmail")}
              <input
                type="email"
                value={newFriendEmail}
                onChange={(e) => {
                  setNewFriendEmail(e.target.value);
                }}
                className={twMerge(
                  basicInputClasses,
                  "border-grey2 border border-solid",
                )}
              />
            </label>

            <input
              type="submit"
              value={t("updateContactForm.update")}
              disabled={contactName === ""}
              className={twMerge(
                inputSubmitClasses,
                "bg-blue1 hover:bg-blue3 hover:border-blue1 hover:text-blue1 focus:bg-blue3 focus:border-blue1 focus:text-blue1 h-11 w-auto text-white sm:w-103.5",
              )}
            />
            {error && <ErrorWarning errorMessage={error} />}
          </form>
        </div>
      </section>
    </Dialog>
  );
}
