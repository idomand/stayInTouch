"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BsClockHistory } from "react-icons/bs";
import { P2 } from "@/Components/ui/Text";
import type { Locale } from "@/i18n/config";
import { getTalkEvents } from "@/lib/actions/contacts";
import type {
  ContactListItem,
  ContactTalkEvent,
} from "@/lib/db/queries/contacts";
import Dialog from "./ui/Dialog";
import ErrorWarning from "./ErrorWarning";

// en-GB keeps the day-month order and 24-hour clock English used before i18n.
const DATE_LOCALES: Record<Locale, string> = { en: "en-GB", de: "de-DE" };

function formatTalkedAt(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(DATE_LOCALES[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type HistoryState =
  | { status: "loading" }
  | { status: "loaded"; events: ContactTalkEvent[] }
  | { status: "failed"; error: string };

/**
 * Read-only talk history for a contact. The events are the append-only
 * talk_events rows the "I talked to them" button creates. The list loads each
 * time the dialog opens, so talks marked since the page loaded show up, and the
 * home page does not carry every contact's full history.
 */
export default function TalkEvents({ contact }: { contact: ContactListItem }) {
  const t = useTranslations();
  const locale = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryState>({ status: "loading" });

  async function loadHistory() {
    setHistory({ status: "loading" });
    try {
      const result = await getTalkEvents(contact.id);
      setHistory(
        result.ok
          ? { status: "loaded", events: result.events }
          : { status: "failed", error: result.error },
      );
    } catch (error) {
      console.error("Could not load talk history:", error);
      setHistory({ status: "failed", error: t("talkEvents.loadFailed") });
    }
  }

  function onOpenModal(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModalOpen(true);
    (e.target as HTMLButtonElement).blur();
    loadHistory();
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpenModal}
        aria-label={t("talkEvents.title")}
        className="bg-blue3 hover:bg-grey2 focus:bg-grey2 relative h-10 cursor-pointer rounded-[55px] border-none px-1 text-center transition-all duration-300"
      >
        <div className="bg-blue1 absolute bottom-6 left-7 h-4.5 w-4.5 rounded-[38px] border border-solid border-transparent text-center leading-4 font-semibold text-white transition-all duration-300">
          {contact.talkEventCount}
        </div>
        <BsClockHistory size={22} className="text-blue1 ml-1 block" />
      </button>

      <Dialog
        title={t("talkEvents.title")}
        close={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <section
          className="flex flex-col items-center"
          aria-busy={history.status === "loading"}
        >
          {history.status === "loading" && (
            <P2 extraClasses="text-grey3 my-4">{t("talkEvents.loading")}</P2>
          )}
          {history.status === "failed" && (
            <ErrorWarning errorMessage={history.error} extraClasses="my-4" />
          )}
          {history.status === "loaded" &&
            (history.events.length === 0 ? (
              <P2 extraClasses="text-grey3 my-4">{t("talkEvents.empty")}</P2>
            ) : (
              <ul className="m-0 w-auto p-0 sm:w-103.5">
                {history.events.map((event) => (
                  <li
                    key={event.id}
                    className="border-green2 bg-grey1 m-1 list-none rounded border border-solid p-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>{formatTalkedAt(event.talkedAt, locale)}</span>
                      {!event.createdByMe && (
                        <P2 extraClasses="text-grey3 text-xs">
                          {t("talkEvents.loggedByFriend")}
                        </P2>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      </Dialog>
    </>
  );
}
