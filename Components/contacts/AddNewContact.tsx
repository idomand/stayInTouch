"use client";
import React, { useState, useId, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FaUserPlus } from "react-icons/fa";
import { addContact } from "@/lib/actions/contacts";
import { maxCadenceDays, maxNameLength } from "@/lib/ConstantsFile";
import ErrorWarning from "@/Components/ui/ErrorWarning";
import CharactersLeft from "@/Components/ui/CharactersLeft";
import DatePickerComponent from "@/Components/ui/DatePickerComponent";
import Spinner from "@/Components/ui/Spinner";
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
  const [isAdding, startAdding] = useTransition();

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    // A transition keeps isAdding true until the revalidated contact list is
    // rendered; resetting a flag after `await` would drop the spinner too early.
    startAdding(async () => {
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
    });
  }

  return (
    <>
      <form
        onSubmit={createNewContact}
        className={twMerge(
          basicFormClasses,
          "mx-auto grid w-[85vw] max-w-195 grid-cols-1 gap-0 px-1 py-2.5 sm:m-auto sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] sm:gap-1 sm:p-3.5",
        )}
      >
        <label className={basicLabelClasses}>
          {t("addNewContact.talkTo")}
          <div className="relative flex flex-col">
            <input
              type="text"
              placeholder={t("common.enterName")}
              name="name"
              value={name}
              required
              maxLength={maxNameLength}
              onChange={nameChangeHandler}
              className={twMerge(
                basicInputClasses,
                "border-grey2 border border-solid pr-14",
              )}
            />
            <CharactersLeft length={name.length} max={maxNameLength} />
          </div>
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
                "border-grey2 mt-0 w-full rounded-lg border border-solid pr-14 pl-2",
              )}
            />
            <span className="text-grey3 pointer-events-none absolute top-1/2 right-7 -translate-y-1/2 text-[10px] font-bold whitespace-nowrap">
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
              "border-grey2 border border-solid",
            )}
          />
        </label>
        <div className="m-1 flex min-w-0 flex-col justify-between [&_.react-datepicker-wrapper]:w-full [&_input]:w-full [&_input]:min-w-0">
          <label htmlFor={lastSpokenId}>{t("addNewContact.lastSpoken")}</label>
          <DatePickerComponent
            id={lastSpokenId}
            setStartDate={setStartDate}
            startDate={startDate}
            maxDate={new Date()}
            onClear={() => setStartDate(null)}
          />
        </div>

        <button
          type="submit"
          disabled={isAdding}
          aria-busy={isAdding}
          className={twMerge(
            inputSubmitClasses,
            "bg-green1 hover:bg-green3 hover:border-green1 hover:text-green1 focus:bg-green3 focus:border-green1 focus:text-green1 mx-1 my-0 flex h-10 items-center justify-center gap-2 text-white sm:col-span-2",
          )}
        >
          {isAdding ? (
            <Spinner className="m-0 h-5 w-5 [&_circle]:stroke-white" />
          ) : (
            <FaUserPlus size={18} aria-hidden="true" />
          )}
          {t("addNewContact.submit")}
        </button>
        {error && (
          <ErrorWarning errorMessage={error} extraClasses="sm:col-span-2 m-1" />
        )}
      </form>
    </>
  );
}
