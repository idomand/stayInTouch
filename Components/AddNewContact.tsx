"use client";
import React, { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { addContact } from "@/lib/actions/contacts";
import { maxCadenceDays } from "@/lib/ConstantsFile";
import ErrorWarning from "./ErrorWarning";
import DatePickerComponent from "./DatePickerComponent";
import {
  basicFormClasses,
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";

export default function AddNewContact() {
  const t = useTranslations();
  const lastSpokenId = useId();
  // A string, so the field can be emptied while typing; checked on submit.
  const [time, setTime] = useState("3");
  const [name, setName] = useState("");
  // null = "never talked": no talk event is recorded for the new contact.
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | false>(false);
  const [friendEmail, setFriendEmail] = useState("");

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    const result = await addContact({
      name,
      cadenceDays: Number(time),
      friendEmail,
      talkedAtMs: startDate?.getTime(),
    });

    if (!result.ok) {
      setError(result.error);
    } else {
      setStartDate(null);
      setName("");
      setFriendEmail("");
      setTime("3");
    }
  }

  return (
    <>
      <form
        onSubmit={createNewContact}
        className={twMerge(
          basicFormClasses,
          "grid w-[85vw] max-w-full mx-auto py-2.5 px-1 gap-0 grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] sm:max-w-[50%] sm:m-auto sm:p-3.5 sm:gap-1 sm:w-auto",
        )}
      >
        <label className={basicLabelClasses}>
          {t("addNewContact.talkTo")}
          <input
            type="text"
            placeholder={t("common.enterName")}
            name="name"
            value={name}
            required
            onChange={nameChangeHandler}
            className={twMerge(
              basicInputClasses,
              "border border-solid border-grey2",
            )}
          />
        </label>
        <label className={basicLabelClasses}>
          {t("addNewContact.every")}
          {/* The unit sits inside the field; right-7 leaves room for the number spinner. */}
          <div className="relative mt-1">
            <input
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
              }}
              type="number"
              name="time"
              required
              max={maxCadenceDays}
              min={1}
              className={twMerge(
                basicInputClasses,
                "border border-solid border-grey2 rounded-lg w-full mt-0 pl-2 pr-14",
              )}
            />
            <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-grey3 font-bold whitespace-nowrap">
              {t("common.days")}
            </span>
          </div>
        </label>

        <label className={basicLabelClasses}>
          {t("addNewContact.friendEmail")}
          <input
            placeholder={t("addNewContact.emailPlaceholder")}
            value={friendEmail}
            onChange={(e) => {
              setFriendEmail(e.target.value);
            }}
            type="email"
            className={twMerge(
              basicInputClasses,
              "border border-solid border-grey2",
            )}
          />
        </label>
        <div className="flex flex-col m-1 justify-between min-w-0 [&_.react-datepicker-wrapper]:w-full [&_input]:w-full [&_input]:min-w-0">
          <label htmlFor={lastSpokenId}>{t("addNewContact.lastSpoken")}</label>
          <DatePickerComponent
            id={lastSpokenId}
            setStartDate={setStartDate}
            startDate={startDate}
            maxDate={new Date()}
            onClear={() => setStartDate(null)}
          />
        </div>

        <input
          type="submit"
          value={t("addNewContact.submit")}
          className={twMerge(
            inputSubmitClasses,
            "sm:col-span-2 bg-green1 text-white h-10 mx-1 my-0 hover:bg-green3 hover:border-green1 hover:text-green1 focus:bg-green3 focus:border-green1 focus:text-green1",
          )}
        />
        {error && (
          <ErrorWarning errorMessage={error} extraClasses="sm:col-span-2 m-1" />
        )}
      </form>
    </>
  );
}
