"use client";
import React, { useState } from "react";
import { isToday } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { BsClockHistory, BsTrash } from "react-icons/bs";
import { P2 } from "@/Components/ui/Text";
import type { Locale } from "@/i18n/config";
import {
  addTalkEvent,
  deleteTalkEvent,
  getTalkEvents,
} from "@/lib/actions/contacts";
import type { ActionResult } from "@/lib/actions/validation";
import type {
  ContactListItem,
  ContactTalkEvent,
} from "@/lib/db/queries/contacts";
import Button from "@/Components/ui/Button";
import Dialog from "@/Components/ui/Dialog";
import DatePickerComponent from "@/Components/ui/DatePickerComponent";
import ErrorWarning from "@/Components/ui/ErrorWarning";

// en-GB keeps the day-month order English used before i18n.
const DATE_LOCALES: Record<Locale, string> = { en: "en-GB", de: "de-DE" };

function formatTalkedAt(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale], {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * The moment to store for a talk picked by day. Today means now, so the talk
 * is not in the future. An earlier day means its local noon, so the day shown
 * does not shift for a viewer a few time zones away.
 */
function talkedAtMsForDay(day: Date): number {
  if (isToday(day)) {
    return Date.now();
  }
  const noon = new Date(day);
  noon.setHours(12, 0, 0, 0);
  return noon.getTime();
}

type HistoryState =
  | { status: "loading" }
  | { status: "loaded"; events: ContactTalkEvent[] }
  | { status: "failed"; error: string };

/**
 * Talk history for a contact, where the user can also add a past talk or
 * delete one. On a linked contact both changes reach the friend's history too
 * (see addTalkEvent and deleteTalkEvent). The list loads each time the dialog
 * opens, so talks marked since the page loaded show up, and the home page does
 * not carry every contact's full history.
 */
export default function TalkEvents({ contact }: { contact: ContactListItem }) {
  const t = useTranslations();
  const locale = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryState>({ status: "loading" });
  const [talkDay, setTalkDay] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  /** `showLoading` is false after a change, so the list does not blink. */
  async function loadHistory(showLoading = true) {
    if (showLoading) {
      setHistory({ status: "loading" });
    }
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

  function onCloseModal() {
    setIsModalOpen(false);
    setTalkDay(new Date());
    setSaveError(null);
    setPendingDeleteId(null);
  }

  /** Runs an add or delete, then reloads the list on success. */
  async function saveChange(change: () => Promise<ActionResult>) {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await change();
      if (result.ok) {
        setPendingDeleteId(null);
        await loadHistory(false);
      } else {
        setSaveError(result.error);
      }
    } catch (error) {
      console.error("Could not change talk history:", error);
      setSaveError(t("talkEvents.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function onAdd() {
    saveChange(() => addTalkEvent(contact.id, talkedAtMsForDay(talkDay)));
  }

  function onConfirmDelete(eventId: string) {
    saveChange(() => deleteTalkEvent(contact.id, eventId));
  }

  const addDateInputId = `talk-date-${contact.id}`;

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
        close={onCloseModal}
        isOpen={isModalOpen}
      >
        <section
          className="flex flex-col items-center"
          aria-busy={history.status === "loading" || isSaving}
        >
          <div className="m-0 flex w-full flex-col gap-2 sm:w-103.5">
            <label htmlFor={addDateInputId} className="text-sm font-medium">
              {t("talkEvents.addTitle")}
            </label>
            <div className="flex items-center gap-2">
              <DatePickerComponent
                id={addDateInputId}
                startDate={talkDay}
                setStartDate={setTalkDay}
                maxDate={new Date()}
              />
              <Button
                buttonText={
                  isSaving ? t("talkEvents.adding") : t("talkEvents.add")
                }
                onClick={onAdd}
                disabled={isSaving}
              />
            </div>
            {contact.isLinked && (
              <P2 extraClasses="text-grey3 text-xs">
                {t("talkEvents.linkedNote")}
              </P2>
            )}
            {saveError && <ErrorWarning errorMessage={saveError} />}
          </div>

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
              <ul className="m-0 mt-3 w-full p-0 sm:w-103.5">
                {history.events.map((event) => {
                  const date = formatTalkedAt(event.talkedAt, locale);
                  return (
                    <li
                      key={event.id}
                      className="border-green2 bg-grey1 m-1 list-none rounded border border-solid p-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          {date}
                          {!event.createdByMe && (
                            <span className="text-grey3 ml-1 text-xs">
                              {t("talkEvents.loggedByFriend")}
                            </span>
                          )}
                        </span>
                        {pendingDeleteId === event.id ? (
                          <span className="flex items-center gap-2">
                            <span className="text-xs">
                              {t("talkEvents.confirmDelete")}
                            </span>
                            <Button
                              buttonText={t("common.cancel")}
                              onClick={() => setPendingDeleteId(null)}
                              variant="Secondary"
                              disabled={isSaving}
                            />
                            <Button
                              buttonText={t("talkEvents.delete")}
                              onClick={() => onConfirmDelete(event.id)}
                              variant="Danger"
                              disabled={isSaving}
                            />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(event.id)}
                            aria-label={t("talkEvents.deleteLabel", { date })}
                            disabled={isSaving}
                            className="text-grey3 hover:text-red1 cursor-pointer rounded border-none bg-transparent p-1 transition-colors duration-300 disabled:cursor-not-allowed"
                          >
                            <BsTrash size={16} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}
        </section>
      </Dialog>
    </>
  );
}
