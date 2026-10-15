"use client";
import { type MouseEvent, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { markAsTalked } from "@/lib/actions/contacts";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import { playTalkEffect, readTalkEffect } from "@/lib/talkEffect";
import MoreOptionsDropdown from "@/Components/contacts/MoreOptionsDropdown";
import TalkEvents from "@/Components/contacts/TalkEvents";
import ErrorWarning from "@/Components/ui/ErrorWarning";
import Spinner from "@/Components/ui/Spinner";

export default function ContactItem({ contact }: { contact: ContactListItem }) {
  const { id, name, daysSinceLastTalk, daysUntilNextTalk } = contact;
  const t = useTranslations();
  const [error, setError] = useState<string | false>(false);
  const [isMarking, startMarking] = useTransition();

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

  function resetFunction(event: MouseEvent<HTMLButtonElement>) {
    // currentTarget is cleared after the event, so keep the button for the effect.
    const button = event.currentTarget;
    // Clearing first remounts a repeated error, so it is announced again.
    setError(false);
    // A transition keeps isMarking true until the revalidated contact data is
    // rendered; resetting a flag after `await` would briefly show the old icon.
    startMarking(async () => {
      const result = await markAsTalked(
        id,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      if (!result.ok) {
        setError(result.error);
      } else {
        void playTalkEffect(readTalkEffect(), button);
      }
    });
  }

  return (
    <li className="my-2.5 flex w-full list-none items-center justify-between">
      <div className="relative grid grow grid-cols-[minmax(0,1fr)_auto] justify-between rounded-[15px] bg-white p-2.5 [grid-template-areas:'contactDetails_notes''contactDates_buttons'] md:grid-cols-none md:[grid-template-areas:'contactDetails_contactDates_notes_buttons']">
        <div className="flex w-full min-w-0 flex-col items-center justify-center [grid-area:contactDetails] md:w-50 md:flex-row md:items-stretch md:justify-start">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="w-full min-w-0 text-center text-xl leading-5.25 font-medium wrap-break-word md:w-max md:text-left">
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
        <div className="mt-3.5 mb-5 flex w-full min-w-0 border-t border-black/10 pt-3.5 [grid-area:contactDates] md:mt-0 md:mb-0 md:w-100 md:max-w-none md:border-t-0 md:pt-0">
          <div className="mx-3.5 flex flex-col items-center justify-center">
            <span className={statusClasses}>{lastTalkedLabel}</span>
          </div>
          <div className="mx-3.5 flex flex-col items-center justify-center">
            <span className={statusClasses}>{nextTalkLabel}</span>
          </div>
        </div>
        <div className="mr-0 flex items-center justify-end gap-2 [grid-area:notes] md:mr-5">
          <TalkEvents contact={contact} />
        </div>
        <div className="flex shrink-0 items-center justify-end [grid-area:buttons]">
          <button
            type="button"
            onClick={resetFunction}
            disabled={isMarking}
            aria-label={t("contactItem.markAsTalked", { name })}
            aria-busy={isMarking}
            className={`hover:text-blue1 cursor-pointer rounded-md border-none bg-transparent p-0 disabled:cursor-wait ${
              isTalkingStatusOK ? "text-green1" : "text-red1"
            }`}
          >
            {isMarking ? (
              <Spinner className="m-0" />
            ) : isTalkingStatusOK ? (
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
