import React, { useState, useEffect } from "react";
import { addContactToFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
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
  const [time, setTime] = useState(3);
  const { currentUser } = useAuth()!;
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
    if (currentUser == null || currentUser.email == null) return;
    let notesArray = [];

    if (note) {
      notesArray[0] = { noteId: 1, data: note };
    }
    let newContact = {
      name: name,
      time: time,
      timeFromLastTalk: startDate.getTime(),
      notesArray: notesArray,
      friendEmail: friendEmail,
    };

    const result = await addContactToFirestore(
      currentUser.uid,
      currentUser.email,
      newContact,
    );
    if (result === "bad") {
      setError("contact already in list");
      setName("");
    } else {
      setNote("");
      setStartDate(new Date());
      setName("");
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
          I would like to talk to:
          <input
            type="text"
            placeholder="Enter Name"
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
            "[grid-area:howMuchTime] relative after:content-['Days'] after:absolute after:top-9 after:left-3.5 after:text-[10px] after:text-grey3 after:font-bold",
          )}
        >
          Every
          <input
            value={time}
            onChange={(e) => {
              setTime(+e.target.value);
            }}
            type="number"
            name="time"
            id="time"
            max={31}
            min={1}
            className={twMerge(
              basicInputClasses,
              "border border-solid border-grey2 rounded-lg",
            )}
          />
        </label>

        <div className="flex flex-col m-1 justify-between [grid-area:lastTalked]">
          Last Time We Have Spoken
          <DatePickerComponent
            setStartDate={setStartDate}
            startDate={startDate}
          />
        </div>
        <label className={twMerge(basicLabelClasses, "[grid-area:notes]")}>
          Add a Note (optional)
          <textarea
            placeholder="Enter Note..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            className="h-10 border border-solid border-grey2 rounded-lg bg-grey1 focus:border focus:border-solid focus:border-blue1"
          />
        </label>
        <label className={twMerge(basicLabelClasses, "[grid-area:emailInput]")}>
          Friend's Email (optional)
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
          value="Add contact"
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
