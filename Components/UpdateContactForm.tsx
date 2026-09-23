"use client";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { updateContact } from "@/lib/actions/contacts";
import {
  basicFormClasses,
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import DatePickerComponent from "./DatePickerComponent";
import ErrorWarning from "./ErrorWarning";
import Dialog from "./ui/Dialog";

type UpdateContactFormProps = {
  contact: ContactListItem;
  isModalOpenProp: boolean;
  onClose: () => void;
};

export default function UpdateContactForm({
  contact,
  isModalOpenProp,
  onClose,
}: UpdateContactFormProps) {
  const [contactName, setContactName] = useState(contact.name);
  const [newFriendEmail, setNewFriendEmail] = useState(
    contact.friendEmail ?? "",
  );
  const [contactTime, setContactTime] = useState(contact.cadenceDays);
  const [error, setError] = useState<string | boolean>(false);
  const [lastTalk, setLastTalk] = useState<number | Date>(
    contact.lastTalkedAt ?? new Date(),
  );
  // A new talk event is inserted only when the user actually touches the date —
  // otherwise editing the name would silently reset "last talked".
  const [dateTouched, setDateTouched] = useState(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function onDateChange(value: React.SetStateAction<number | Date>) {
    setDateTouched(true);
    setLastTalk(value);
  }

  async function updateContactOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nameChanged = contactName !== contact.name;
    const cadenceChanged = +contactTime !== contact.cadenceDays;
    const emailChanged = newFriendEmail !== (contact.friendEmail ?? "");

    if (!nameChanged && !cadenceChanged && !emailChanged && !dateTouched) {
      onClose();
      return;
    }

    const talkedAtMs = dateTouched
      ? lastTalk instanceof Date
        ? lastTalk.getTime()
        : lastTalk
      : undefined;

    const result = await updateContact(contact.id, {
      name: contactName,
      cadenceDays: +contactTime,
      friendEmail: newFriendEmail,
      talkedAtMs,
    });

    if (!result.ok) {
      setError(result.error);
      setContactName(contact.name);
    } else {
      onClose();
    }
  }

  function timeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactTime(+e.target.value);
  }

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  function onCloseModal() {
    setContactName(contact.name);
    setContactTime(contact.cadenceDays);
    if (error) {
      setError(false);
    }
    onClose();
  }

  return (
    <Dialog
      title={`Update contact: ${contact.name}`}
      isOpen={isModalOpenProp}
      close={() => {
        onCloseModal();
      }}
    >
      <section className="flex flex-col justify-center sm:flex-row">
        <div>
          <form
            onSubmit={updateContactOnSubmit}
            className={twMerge(
              basicFormClasses,
              " rounded-none p-2.5 m-0 gap-1  sm:p-3.5 sm:m-2.5 sm:gap-7.5 ",
            )}
          >
            <label className={twMerge(basicLabelClasses, "")}>
              Change Name:
              <input
                type="text"
                placeholder="Enter Name"
                name="name"
                value={contactName}
                required
                onChange={nameChangeHandler}
                className={twMerge(
                  basicInputClasses,
                  "border border-solid border-grey2 p-1",
                )}
              />
            </label>
            <label
              className={twMerge(
                basicLabelClasses,
                " relative after:content-['Days'] after:font-bold after:absolute after:top-8 after:left-5 after:text-[10px] after:text-grey3",
              )}
            >
              Change Talk Every X Days:
              <input
                type="number"
                name="time"
                id="time"
                max={60}
                min={1}
                value={contactTime}
                onChange={timeChangeHandler}
                className={twMerge(
                  basicInputClasses,
                  "border border-solid border-grey2 rounded-lg",
                )}
              />
            </label>
            <div className="flex flex-col m-1 justify-between">
              Change Last Time We Have Spoken
              <DatePickerComponent
                setStartDate={onDateChange}
                startDate={lastTalk}
              />
            </div>

            <label className={twMerge(basicLabelClasses, "")}>
              Change Friend Email:
              <input
                type="email"
                value={newFriendEmail}
                onChange={(e) => {
                  setNewFriendEmail(e.target.value);
                }}
                className={twMerge(
                  basicInputClasses,
                  " border border-solid border-grey2",
                )}
              />
            </label>

            <input
              type="submit"
              value="Update"
              disabled={contactName === ""}
              className={twMerge(
                inputSubmitClasses,
                " bg-blue1 text-white w-auto h-11 hover:bg-blue3 hover:border-blue1 hover:text-blue1 focus:bg-blue3 focus:border-blue1 focus:text-blue1 sm:w-103.5",
              )}
            />
            {error && <ErrorWarning errorMessage={error} />}
          </form>
        </div>
      </section>
    </Dialog>
  );
}
