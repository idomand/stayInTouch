"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { addNote, updateNote } from "@/lib/actions/contacts";
import {
  basicFormClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import NoteItem from "./NoteItem";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import ErrorWarning from "./ErrorWarning";

export default function Notes({ contact }: { contact: ContactListItem }) {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteInputValue, setNoteInputValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | boolean>(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function onOpenModal(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModalOpen(true);
    (e.target as HTMLButtonElement).blur();
  }

  function onSubmitFunc(e: React.FormEvent<HTMLFormElement>) {
    isEditMode ? updatedNoteFunc(e) : addNewNoteFunc(e);
  }

  function switchToEditMode(oldNoteData: string, oldNoteId: string) {
    setIsEditMode(true);
    setNoteInputValue(oldNoteData);
    setEditNoteId(oldNoteId);
  }

  function cancelEdit() {
    setIsEditMode(false);
    setNoteInputValue("");
  }

  async function updatedNoteFunc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editNoteId == null) {
      return;
    }
    const result = await updateNote(contact.id, editNoteId, noteInputValue);
    if (!result.ok) {
      setError(result.error);
    } else {
      setIsEditMode(false);
      setNoteInputValue("");
      (e.target as HTMLFormElement).blur();
    }
  }

  async function addNewNoteFunc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await addNote(contact.id, noteInputValue);
    if (!result.ok) {
      setError(result.error);
    } else {
      setNoteInputValue("");
      (e.target as HTMLFormElement).blur();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpenModal}
        className="px-1 cursor-pointer h-10 bg-blue3 border-none rounded-[55px] text-center relative transition-all duration-300 hover:bg-grey2 focus:bg-grey2"
      >
        <div className=" leading-4 rounded-[38px] text-center font-semibold h-4.5 w-4.5 absolute bottom-6 left-7 bg-blue1 text-white transition-all duration-300 border border-solid border-transparent">
          {contact.notes.length}
        </div>
        <img src="/notes.svg" className="block ml-1" />
      </button>

      <Dialog
        title={t("notes.title")}
        close={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <section>
          <div className="flex flex-col items-center relative">
            <form
              onSubmit={onSubmitFunc}
              className={twMerge(basicFormClasses, "flex flex-col")}
            >
              <textarea
                required
                placeholder={t("common.enterNote")}
                value={noteInputValue}
                onChange={(e) => {
                  setNoteInputValue(e.target.value);
                }}
                className="bg-grey1 rounded-[10px] p-2.5 w-auto sm:w-103.5 h-18"
              />
              <div className="flex justify-center">
                {isEditMode && (
                  <Button onClick={cancelEdit} buttonText={t("common.cancel")} />
                )}
                <input
                  type="submit"
                  value={isEditMode ? t("notes.updateNote") : t("notes.addNote")}
                  className={twMerge(
                    inputSubmitClasses,
                    "bg-blue1 text-white px-3.5 py-2.5 hover:bg-blue3 hover:border-blue1 hover:text-blue1 focus:bg-blue3 focus:border-blue1 focus:text-blue1",
                  )}
                />
              </div>
            </form>
            {error && <ErrorWarning errorMessage={error} />}
          </div>
          <div className="flex flex-col items-center">
            <ul className="p-0 m-0">
              {contact.notes.map((note) => {
                return (
                  <NoteItem
                    key={note.id}
                    noteId={note.id}
                    body={note.body}
                    contactId={contact.id}
                    switchToEditMode={switchToEditMode}
                  />
                );
              })}
            </ul>
          </div>
        </section>
      </Dialog>
    </>
  );
}
