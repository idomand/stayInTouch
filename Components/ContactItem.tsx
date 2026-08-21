// import { useMedia } from "react-use";
import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import { useAuth } from "../lib/AuthContext";
import { oneDay } from "../lib/ConstantsFile";
import { updateContact } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import Notes from "./Notes";

export default function ContactItem({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
}: ContactItemType) {
  const { currentUser } = useAuth()!;
  const currantTime = new Date().getTime();

  let nextTalkResponse;
  let lastTalkedToResponse;
  let isTalkingStatusOK;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    isTalkingStatusOK = true;
  } else {
    isTalkingStatusOK = false;
  }

  if (currantTime - timeFromLastTalk < 86000000) {
    lastTalkedToResponse = (
      <span
        className={`text-base font-semibold leading-5 text-center m-0 ${isTalkingStatusOK ? "text-grey3" : "text-red1"}`}
      >
        Talked today
      </span>
    );
  } else {
    lastTalkedToResponse = (
      <span
        className={`text-base font-semibold leading-5 text-center m-0 ${isTalkingStatusOK ? "text-grey3" : "text-red1"}`}
      >
        Didn’t talk for {Math.floor((currantTime - timeFromLastTalk) / oneDay)}{" "}
        days
      </span>
    );
  }

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  if (nextTalkInDays > 0) {
    nextTalkResponse = (
      <span
        className={`text-base font-semibold leading-5 text-center m-0 ${isTalkingStatusOK ? "text-grey3" : "text-red1"}`}
      >
        Talk in {nextTalkInDays} days
      </span>
    );
  } else {
    nextTalkResponse = (
      <span
        className={`text-base font-semibold leading-5 text-center m-0 ${isTalkingStatusOK ? "text-grey3" : "text-red1"}`}
      >
        Talk Today!
      </span>
    );
  }

  function resetFunction() {
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    const oldContactData = {
      name: name,
      time: time,
      timeFromLastTalk: timeFromLastTalk,
      notesArray: notesArray,
      friendEmail: friendEmail,
    };
    const newContactData = {
      name: name,
      time: time,
      timeFromLastTalk: currantTime,
      notesArray: notesArray,
      friendEmail: friendEmail,
    };
    updateContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      oldContactData,
      newContactData,
      "reset",
    );
  }

  return (
    <li className="flex items-center justify-between list-none mx-1 my-2.5 w-[85vw] sm:w-auto">
      <div className="grid grow justify-between bg-white rounded-[15px] p-2.5 [grid-template-areas:'contactDetails_notes''contactDates_buttons'] sm:[grid-template-areas:'contactDetails_contactDates_notes_buttons']">
        <div className="[grid-area:contactDetails] flex flex-col items-center justify-center w-50 sm:flex-row sm:items-stretch sm:justify-start">
          <div className="flex flex-col justify-center">
            <span className="font-medium text-xl leading-5.25 capitalize w-40 text-center sm:w-max sm:text-left">
              {name}
            </span>
          </div>
        </div>
        <div className="[grid-area:contactDates] flex w-100 border-t border-black/10 pt-3.5 mt-3.5 mb-5 max-w-50 sm:border-t-0 sm:pt-0 sm:mt-0 sm:mb-0 sm:max-w-none">
          <div className="flex flex-col justify-center items-center mx-3.5">
            {lastTalkedToResponse}
          </div>
          <div className="flex flex-col justify-center items-center mx-3.5">
            {nextTalkResponse}
          </div>
        </div>
        {/* <MoreOptionsWrapper>
          <MoreOptions
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </MoreOptionsWrapper> */}
        <div className="[grid-area:notes] flex justify-end items-center mr-0 sm:mr-5">
          <Notes
            friendEmail={friendEmail}
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </div>
        <div className="[grid-area:buttons] flex items-center justify-end">
          {isTalkingStatusOK ? (
            <IoCheckboxOutline
              onClick={resetFunction}
              size={50}
              className="cursor-pointer text-green1 hover:text-blue1"
            />
          ) : (
            <BsExclamationSquare
              onClick={resetFunction}
              size={50}
              className="cursor-pointer text-red1 hover:text-blue1"
            />
          )}

          <MoreOptionsDropdown
            friendEmail={friendEmail}
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />

          {/* <AddToGoogle onClick={addToGoogle}>Book</AddToGoogle> */}
        </div>
      </div>
    </li>
  );
}
