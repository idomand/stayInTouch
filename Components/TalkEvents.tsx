"use client";
import React, { useState } from "react";
import { BsClockHistory } from "react-icons/bs";
import { P2 } from "@/Components/ui/Text";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import Dialog from "./ui/Dialog";

function formatTalkedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Read-only talk history for a contact, shown next to Notes. The events are the
 * append-only talk_events rows the "I talked to them" button creates; this just
 * displays them, newest first.
 */
export default function TalkEvents({ contact }: { contact: ContactListItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function onOpenModal(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModalOpen(true);
    (e.target as HTMLButtonElement).blur();
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpenModal}
        aria-label="Talk history"
        className="px-1 cursor-pointer h-10 bg-blue3 border-none rounded-[55px] text-center relative transition-all duration-300 hover:bg-grey2 focus:bg-grey2"
      >
        <div className=" leading-4 rounded-[38px] text-center font-semibold h-4.5 w-4.5 absolute bottom-6 left-7 bg-blue1 text-white transition-all duration-300 border border-solid border-transparent">
          {contact.talkEvents.length}
        </div>
        <BsClockHistory size={22} className="block ml-1 text-blue1" />
      </button>

      <Dialog
        title="Talk history"
        close={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <section className="flex flex-col items-center">
          {contact.talkEvents.length === 0 ? (
            <P2 extraClasses="text-grey3 my-4">No talks recorded yet.</P2>
          ) : (
            <ul className="p-0 m-0 w-auto sm:w-103.5">
              {contact.talkEvents.map((event) => (
                <li
                  key={event.id}
                  className="list-none p-2 m-1 border border-solid border-green2 bg-grey1 rounded text-sm"
                >
                  {formatTalkedAt(event.talkedAt)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </Dialog>
    </>
  );
}
