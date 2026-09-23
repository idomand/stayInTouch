"use client";
import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import { markAsTalked } from "@/lib/actions/contacts";
import { oneDay } from "@/lib/ConstantsFile";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import Notes from "./Notes";

export default function ContactItem({ contact }: { contact: ContactListItem }) {
  const { id, name, lastTalkedAt, daysUntilNextTalk } = contact;
  const now = Date.now();

  // On time when there are days left before the next talk; never-talked
  // (null) and overdue (<= 0) both read as "needs attention".
  const isTalkingStatusOK = daysUntilNextTalk != null && daysUntilNextTalk > 0;
  const statusClasses = `text-base font-semibold leading-5 text-center m-0 ${
    isTalkingStatusOK ? "text-grey3" : "text-red1"
  }`;

  let lastTalkedLabel: string;
  if (lastTalkedAt == null) {
    lastTalkedLabel = "Never talked";
  } else {
    const elapsed = now - new Date(lastTalkedAt).getTime();
    lastTalkedLabel =
      elapsed < oneDay
        ? "Talked today"
        : `Didn’t talk for ${Math.floor(elapsed / oneDay)} days`;
  }

  const nextTalkLabel =
    daysUntilNextTalk != null && daysUntilNextTalk > 0
      ? `Talk in ${Math.ceil(daysUntilNextTalk)} days`
      : "Talk Today!";

  async function resetFunction() {
    const result = await markAsTalked(id);
    if (!result.ok) {
      console.error(result.error);
    }
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
            <span className={statusClasses}>{lastTalkedLabel}</span>
          </div>
          <div className="flex flex-col justify-center items-center mx-3.5">
            <span className={statusClasses}>{nextTalkLabel}</span>
          </div>
        </div>
        <div className="[grid-area:notes] flex justify-end items-center mr-0 sm:mr-5">
          <Notes contact={contact} />
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

          <MoreOptionsDropdown contact={contact} />
        </div>
      </div>
    </li>
  );
}
