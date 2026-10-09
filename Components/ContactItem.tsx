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
    <li className="mx-1 my-2.5 flex w-[85vw] list-none items-center justify-between sm:w-auto">
      <div className="relative grid grow grid-cols-[minmax(0,1fr)_auto] justify-between rounded-[15px] bg-white p-2.5 [grid-template-areas:'contactDetails_notes''contactDates_buttons'] sm:grid-cols-none sm:[grid-template-areas:'contactDetails_contactDates_notes_buttons']">
        <div className="flex w-full min-w-0 flex-col items-center justify-center [grid-area:contactDetails] sm:w-50 sm:flex-row sm:items-stretch sm:justify-start">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="w-full min-w-0 text-center text-xl leading-5.25 font-medium wrap-break-word sm:w-max sm:text-left">
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
        <div className="mt-3.5 mb-5 flex w-full min-w-0 border-t border-black/10 pt-3.5 [grid-area:contactDates] sm:mt-0 sm:mb-0 sm:w-100 sm:max-w-none sm:border-t-0 sm:pt-0">
          <div className="mx-3.5 flex flex-col items-center justify-center">
            <span className={statusClasses}>{lastTalkedLabel}</span>
          </div>
          <div className="mx-3.5 flex flex-col items-center justify-center">
            <span className={statusClasses}>{nextTalkLabel}</span>
          </div>
        </div>
        <div className="mr-0 flex items-center justify-end gap-2 [grid-area:notes] sm:mr-5">
          <TalkEvents contact={contact} />
        </div>
        <div className="flex shrink-0 items-center justify-end [grid-area:buttons]">
          <button
            type="button"
            onClick={resetFunction}
            disabled={isMarking}
            aria-label={t("contactItem.markAsTalked", { name })}
            className={`hover:text-blue1 cursor-pointer rounded-md border-none bg-transparent p-0 disabled:cursor-wait disabled:opacity-50 ${
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
