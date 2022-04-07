import React, { useState } from "react";
import ReactModal from "react-modal";
import NoteItem from "../NoteItem";
import { updateContact, updateNote } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import {
  AddNewNoteForm,
  AddNewNoteWrapper,
  ChancelEditButton,
  CloseModalButton,
  ContactNameText,
  ContactNameWrapper,
  NewNoteInput,
  NewNoteSubmit,
  NotesButton,
  NotesButtonsWrapper,
  NotesHeader,
  NotesList,
  NotesListWrapper,
  NotesLogo,
  NotesWrapper,
  NotsNumber,
} from "./NotesStyle";
import { H5 } from "../Common/StyledText";

type Props = {
  contactId: string;
  name: string;
  time: number;
  timeFromLastTalk: number;
  notesArray: any;
  notesArrayData: any;
};

export default function Notes(props: Props) {
  const { currentUser } = useAuth();
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
    await updateNote(
      currentUser.uid,
      currentUser.email,
      props.contactId,
      editNoteId,
      noteInputValue
    );
    setIsEditMood(false);
    setNoteInputValue("");
    (e.target as HTMLFormElement).blur();
  }

  async function addNewNoteToArray(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let biggestId;
    if (props.notesArray.length === 0) {
      biggestId = 0;
    } else {
      biggestId = props.notesArray[props.notesArray.length - 1].id;
    }
    const newNotesArray = [
      ...props.notesArray,
      { id: biggestId + 1, data: noteInputValue },
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
      newContactData
    );
    setNoteInputValue("");
    (e.target as HTMLFormElement).blur();
  }

  return (
    <>
      {props.notesArray && props.notesArray.length ? (
        <>
          <NotesButton onClick={onOpenModal}>
            <NotsNumber>{props.notesArray.length}</NotsNumber>
            <NotesLogo src="/notes.svg" />
          </NotesButton>
        </>
      ) : (
        <>
          <NotesButton onClick={onOpenModal}>
            <NotsNumber>0</NotsNumber>
            <NotesLogo src="/notes.svg" />
          </NotesButton>
        </>
      )}

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
        <NotesWrapper>
          <NotesHeader>
            <ContactNameWrapper>
              <H5>Contact Notes: </H5>
              <ContactNameText>{props.name}</ContactNameText>
            </ContactNameWrapper>
            <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
          </NotesHeader>
          <AddNewNoteWrapper>
            <AddNewNoteForm onSubmit={onSubmitFunc}>
              <NewNoteInput
                required
                placeholder="Enter Note..."
                value={noteInputValue}
                onChange={(e) => {
                  setNoteInputValue(e.target.value);
                }}
              />
              <NotesButtonsWrapper>
                {isEditMood && (
                  <ChancelEditButton onClick={cancelEdit}>
                    cancel
                  </ChancelEditButton>
                )}
                <NewNoteSubmit
                  value={isEditMood ? "Update Note" : "Add Note"}
                  type="submit"
                />
              </NotesButtonsWrapper>
            </AddNewNoteForm>
          </AddNewNoteWrapper>
          <NotesListWrapper>
            <NotesList>
              {props.notesArray &&
                props.notesArray.length &&
                props.notesArray.map((note: { data: string; id: number }) => {
                  return (
                    <NoteItem
                      key={note.id}
                      data={note.data}
                      noteId={note.id}
                      contactId={props.contactId}
                      switchToEditMood={switchToEditMood}
                    />
                  );
                })}
            </NotesList>
          </NotesListWrapper>
        </NotesWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================
