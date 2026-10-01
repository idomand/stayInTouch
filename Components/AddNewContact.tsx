"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addContact } from "@/lib/actions/contacts";
import { maxCadenceDays } from "@/lib/ConstantsFile";
import ErrorWrapper from "./ErrorWarning";
import DatePickerComponent from "./DatePickerComponent";
import {
  basicFormClasses,
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";

export default function AddNewContact() {
  const t = useTranslations("AddNewContact");
  const tCommon = useTranslations("common");
  const [time, setTime] = useState(3);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState<string | boolean>(false);
  const [note, setNote] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = await addContact({
      name,
      cadenceDays: time,
      friendEmail,
      note,
      talkedAtMs: startDate.getTime(),
    });

    if (!result.ok) {
      setError(result.error);
      setName("");
    } else {
      setNote("");
      setStartDate(new Date());
      setName("");
      setFriendEmail("");
      setTime(3);
    }
  }

  return (
    <>
      <form
        onSubmit={createNewContact}
        className={twMerge(
          basicFormClasses,
          "grid w-[85vw] max-w-full py-2.5 px-1 gap-0 [grid-template-areas:'name_howMuchTime''lastTalked_lastTalked''notes_notes''emailInput_emailInput''submit_submit'] sm:max-w-[50%] sm:m-auto sm:p-3.5 sm:gap-1 sm:w-auto sm:[grid-template-areas:'name_howMuchTime_howMuchTime''lastTalked_notes_notes''emailInput_emailInput_emailInput''submit_submit_submit']",
        )}
      >
        <label className={twMerge(basicLabelClasses, "[grid-area:name]")}>
          {t("talkTo")}
          <input
            type="text"
            placeholder={tCommon("enterName")}
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
        <label
          className={twMerge(
            basicLabelClasses,
            "[grid-area:howMuchTime]",
          )}
        >
          {t("every")}
          <div className="flex items-center gap-1">
            <input
              value={time}
              onChange={(e) => {
                setTime(+e.target.value);
              }}
              type="number"
              name="time"
              id="time"
              max={maxCadenceDays}
              min={1}
              className={twMerge(
                basicInputClasses,
                "border border-solid border-grey2 rounded-lg flex-1",
              )}
            />
            <span className="text-[10px] text-grey3 font-bold whitespace-nowrap">{tCommon("days")}</span>
          </div>
        </label>

        <div className="flex flex-col m-1 justify-between [grid-area:lastTalked]">
          {t("lastSpoken")}
          <DatePickerComponent
            setStartDate={setStartDate}
            startDate={startDate}
            maxDate={new Date()}
          />
        </div>
        <label className={twMerge(basicLabelClasses, "[grid-area:notes]")}>
          {t("addNote")}
          <textarea
            placeholder={tCommon("enterNote")}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            className="h-10 border border-solid border-grey2 rounded-lg bg-grey1 focus:border focus:border-solid focus:border-blue1"
          />
        </label>
        <label className={twMerge(basicLabelClasses, "[grid-area:emailInput]")}>
          {t("friendEmail")}
          <input
            placeholder="new-friend@friendship.com"
            value={friendEmail}
            onChange={(e) => {
              setFriendEmail(e.target.value);
            }}
            type="email"
            className={twMerge(
              basicInputClasses,
              "[grid-area:emailInput] border border-solid border-grey2",
            )}
          />
        </label>

        <input
          type="submit"
          value={t("submit")}
          className={twMerge(
            inputSubmitClasses,
            "[grid-area:submit] bg-green1 text-white h-10 mx-1 my-0 hover:bg-green3 hover:border-green1 hover:text-green1 focus:bg-green3 focus:border-green1 focus:text-green1",
          )}
        />
      </form>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}
