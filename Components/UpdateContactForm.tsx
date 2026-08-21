import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { updateContact } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import {
  basicFormClasses,
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";
import DatePickerComponent from "./DatePickerComponent";
import ErrorWarning from "./ErrorWarning";
import Dialog from "./ui/Dialog";

type UpdateContactFormState = ContactItemType & {
  isModalOpenProp: boolean;
  onClose: () => void;
};

export default function UpdateContactForm({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
  isModalOpenProp,
  onClose,
}: UpdateContactFormState) {
  const { currentUser } = useAuth()!;
  const [contactName, setContactName] = useState(name);
  const [newFriendEmail, setNewFriendEmail] = useState(friendEmail);
  const [contactTime, setContactTime] = useState(time);
  const [error, setError] = useState<string | boolean>(false);
  const [lastTalk, setLastTalk] = useState<any>(timeFromLastTalk);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  async function updateContactOnSubmit(e: React.FocusEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    let timeFromLastTalkVar = lastTalk;

    if (lastTalk instanceof Date) {
      timeFromLastTalkVar = lastTalk.getTime();
    }

    const oldContactData = {
      name,
      time,
      timeFromLastTalk,
      contactId,
      notesArray,
      friendEmail,
    };
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalkVar,
      notesArray: notesArray,
      friendEmail: newFriendEmail,
    };

    let result;

    /* //* if nothing was change ==> just return */
    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time &&
      oldContactData.timeFromLastTalk == newContactData.timeFromLastTalk
    ) {
      onClose();
    } else {
      result = await updateContact(
        currentUser.uid,
        currentUser.email,
        contactId,
        oldContactData,
        newContactData,
        "edit",
      );
    }
    if (result === "bad") {
      setError("contact already in list");
      setContactName(name);
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
    // setIsModalOpen(false);
    setContactName(name);
    setContactTime(time);
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  return (
    <Dialog
      title={`Update contact: ${name}`}
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
                setStartDate={setLastTalk}
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
