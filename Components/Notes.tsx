import React, { useState } from "react";
import ReactModal from "react-modal";
import { useAuth } from "../lib/AuthContext";
import { updateContact, updateNote } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import { H5 } from "@/Components/ui/Text";
import {
  basicFormClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";
import NoteItem from "./NoteItem";
import Button from "./ui/Button";

export default function Notes(props: ContactItemType) {
  const { currentUser } = useAuth()!;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteInputValue, setNoteInputValue] = useState("");
  const [isEditMood, setIsEditMood] = useState(false);
  const [editNoteId, setEditNoteId] = useState<null | number>(null);

  function onCloseModal() {
    setIsModalOpen(false);
  }

  function onOpenModal(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModalOpen(true);
    (e.target as HTMLButtonElement).blur();
  }

  function onSubmitFunc(e: React.FormEvent<HTMLFormElement>) {
    isEditMood ? updatedNoteFunc(e) : addNewNoteToArray(e);
  }

  function switchToEditMood(oldNoteData: string, OldNoteId: number) {
    setIsEditMood(true);
    setNoteInputValue(oldNoteData);
    setEditNoteId(OldNoteId);
  }

  function cancelEdit() {
    setIsEditMood(false);
    setNoteInputValue("");
  }
  async function updatedNoteFunc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      currentUser == null ||
      currentUser.email == null ||
      editNoteId == null ||
      props.contactId == null
    )
      return;

    await updateNote(
      currentUser.uid,
      currentUser.email,
      props.contactId,
      editNoteId,
      noteInputValue,
    );
    setIsEditMood(false);
    setNoteInputValue("");
    (e.target as HTMLFormElement).blur();
  }

  async function addNewNoteToArray(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      currentUser == null ||
      currentUser.email == null ||
      props.contactId == null ||
      props.notesArray == null
    )
      return;

    let biggestId;
    if (props.notesArray.length === 0) {
      biggestId = 0;
    } else {
      biggestId = props.notesArray[props.notesArray.length - 1].noteId;
    }
    const newNotesArray = [
      ...props.notesArray,
      { noteId: biggestId + 1, data: noteInputValue },
    ];

    const oldContactData = { ...props };
    const newContactData = {
      ...props,
      notesArray: newNotesArray,
    };
    await updateContact(
      currentUser.uid,
      currentUser.email,
      props.contactId,
      oldContactData,
      newContactData,
      "addNote",
    );
    setNoteInputValue("");
    (e.target as HTMLFormElement).blur();
  }

  return (
    <>
      <button
        onClick={onOpenModal}
        className="px-1 cursor-pointer h-10 bg-blue3 border-none rounded-[55px] text-center relative transition-all duration-300 hover:bg-grey2 focus:bg-grey2"
      >
        <div className=" leading-4 rounded-[38px] text-center font-semibold h-4.5 w-4.5 absolute bottom-6 left-7 bg-blue1 text-white transition-all duration-300 border border-solid border-transparent group-hover:bg-white group-hover:border-blue1 group-hover:text-blue1 group-focus:bg-white group-focus:border-blue1 group-focus:text-blue1">
          {props.notesArray.length}
        </div>
        <img src="/notes.svg" className="block ml-1" />
      </button>

      <ReactModal
        ariaHideApp={false}
        isOpen={isModalOpen}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseModal}
        className={"contact-edit-modal"}
        overlayClassName={"contact-edit-modal-overlay"}
      >
        <section>
          <div className="flex justify-between px-6 py-1">
            <div className="flex m-auto">
              <H5>Contact Notes: </H5>
              <H5 extraClasses="text-blue2 font-semibold ml-1">{props.name}</H5>
            </div>
            <Button onClick={onCloseModal} buttonText="X" variant="Ghost" />
          </div>
          <div className="flex flex-col items-center">
            <form
              onSubmit={onSubmitFunc}
              className={twMerge(basicFormClasses, "flex flex-col")}
            >
              <textarea
                required
                placeholder="Enter Note..."
                value={noteInputValue}
                onChange={(e) => {
                  setNoteInputValue(e.target.value);
                }}
                className="bg-grey1 rounded-[10px] p-2.5 w-auto sm:w-103.5 h-18"
              />
              <div className="flex justify-center">
                {isEditMood && (
                  <Button onClick={cancelEdit} buttonText="Cancel" />
                )}
                <input
                  type="submit"
                  value={isEditMood ? "Update Note" : "Add Note"}
                  className={twMerge(
                    inputSubmitClasses,
                    "bg-blue1 text-white px-3.5 py-2.5 hover:bg-blue3 hover:border-blue1 hover:text-blue1 focus:bg-blue3 focus:border-blue1 focus:text-blue1",
                  )}
                />
              </div>
            </form>
          </div>
          <div className="flex flex-col items-center">
            <ul className="p-0 m-0">
              {props.notesArray &&
                props.notesArray.length &&
                props.notesArray.map(
                  (note: { data: string; noteId: number }) => {
                    return (
                      <NoteItem
                        key={note.noteId}
                        data={note.data}
                        noteId={note.noteId}
                        contactId={props.contactId!}
                        switchToEditMood={switchToEditMood}
                      />
                    );
                  },
                )}
            </ul>
          </div>
        </section>
      </ReactModal>
    </>
  );
}
