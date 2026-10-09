"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { markAsTalked } from "@/lib/actions/contacts";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import TalkEvents from "./TalkEvents";
import ErrorWarning from "./ErrorWarning";

export default function ContactItem({ contact }: { contact: ContactListItem }) {
  const { id, name, daysSinceLastTalk, daysUntilNextTalk } = contact;
  const t = useTranslations();
  const [error, setError] = useState<string | false>(false);
  const [isMarking, setIsMarking] = useState(false);

  // On time when there are days left before the next talk; never-talked
  // (null) and overdue (<= 0) both read as "needs attention".
  const isTalkingStatusOK = daysUntilNextTalk != null && daysUntilNextTalk > 0;
  const statusClasses = `text-base font-semibold leading-5 text-center m-0 ${
    isTalkingStatusOK ? "text-grey3" : "text-red1"
  }`;

  let lastTalkedLabel: string;
  if (daysSinceLastTalk == null) {
    lastTalkedLabel = t("contactItem.neverTalked");
  } else {
    lastTalkedLabel =
      daysSinceLastTalk < 1
        ? t("contactItem.talkedToday")
        : t("contactItem.daysSinceTalk", {
            days: Math.floor(daysSinceLastTalk),
          });
  }

  const nextTalkLabel =
    daysUntilNextTalk != null && daysUntilNextTalk > 0
      ? t("contactItem.talkInDays", { days: Math.ceil(daysUntilNextTalk) })
      : t("contactItem.talkToday");

  async function resetFunction() {
    // Clearing first remounts a repeated error, so it is announced again.
    setError(false);
    setIsMarking(true);
    try {
      const result = await markAsTalked(id);
      if (!result.ok) {
        setError(result.error);
      }
    } finally {
      setIsMarking(false);
    }
  }

  return (
    <li className="flex items-center justify-between list-none mx-1 my-2.5 w-[85vw] sm:w-auto">
      <div className="grid grow justify-between bg-white rounded-[15px] p-2.5 [grid-template-areas:'contactDetails_notes''contactDates_buttons'] sm:[grid-template-areas:'contactDetails_contactDates_notes_buttons'] grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-none relative">
        <div className="[grid-area:contactDetails] flex flex-col items-center justify-center w-full min-w-0 sm:w-50 sm:flex-row sm:items-stretch sm:justify-start">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-medium text-xl leading-5.25 w-full min-w-0 wrap-break-word text-center sm:w-max sm:text-left">
                {name}
              </span>
              {contact.isLinked && (
                <FaLink
                  size={14}
                  className="text-blue1 shrink-0"
                  title={t("contactItem.linkedTitle")}
                  aria-label={t("contactItem.linkedLabel", { name })}
                />
              )}
            </div>
          </div>
        </div>
        <div className="[grid-area:contactDates] flex w-full min-w-0 border-t border-black/10 pt-3.5 mt-3.5 mb-5 sm:w-100 sm:max-w-none sm:border-t-0 sm:pt-0 sm:mt-0 sm:mb-0">
          <div className="flex flex-col justify-center items-center mx-3.5">
            <span className={statusClasses}>{lastTalkedLabel}</span>
          </div>
          <div className="flex flex-col justify-center items-center mx-3.5">
            <span className={statusClasses}>{nextTalkLabel}</span>
          </div>
        </div>
        <div className="[grid-area:notes] flex justify-end items-center gap-2 mr-0 sm:mr-5">
          <TalkEvents contact={contact} />
        </div>
        <div className="[grid-area:buttons] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={resetFunction}
            disabled={isMarking}
            aria-label={t("contactItem.markAsTalked", { name })}
            className={`cursor-pointer bg-transparent border-none p-0 rounded-md hover:text-blue1 disabled:cursor-wait disabled:opacity-50 ${
              isTalkingStatusOK ? "text-green1" : "text-red1"
            }`}
          >
            {isTalkingStatusOK ? (
              <IoCheckboxOutline size={50} aria-hidden="true" />
            ) : (
              <BsExclamationSquare size={50} aria-hidden="true" />
            )}
          </button>

          <MoreOptionsDropdown contact={contact} />
        </div>
        {error && (
          <ErrorWarning
            errorMessage={error}
            extraClasses="col-span-full mt-2"
          />
        )}
      </div>
    </li>
  );
}
