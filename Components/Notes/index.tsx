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

/* 
contactId: "4qAJBxVyHDFYQPbjmGNu"
name: "aaa"
notesArray: [{…}]
notesArrayData: [{…}]
time: 3
timeFromLastTalk: 1649156957442
*/

export default function Notes(props: Props) {
  console.log("props :>> ", props);
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteInputValue, setNoteInputValue] = useState("");
  const [isEditMood, setIsEditMood] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  function onCloseModal() {
    setIsModalOpen(false);
  }

  function onOpenModal(e) {
    setIsModalOpen(true);
    e.currentTarget.blur();
  }

  function switchToEditMood(oldNoteData, OldNoteId) {
    setIsEditMood(true);
    setNoteInputValue(oldNoteData);
    setEditNoteId(OldNoteId);
  }

  function cancelEdit() {
    setIsEditMood(false);
    setNoteInputValue("");
  }

  async function updatedNoteFunc(e) {
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
    e.target.blur();
  }

  async function addNewNoteToArray(e) {
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
    e.target.blur();
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
              <ContactNameText>{name}</ContactNameText>
            </ContactNameWrapper>
            <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
          </NotesHeader>
          <AddNewNoteWrapper>
            <AddNewNoteForm
              onSubmit={isEditMood ? updatedNoteFunc : addNewNoteToArray}
            >
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
                props.notesArray.map((note) => {
                  return (
                    <NoteItem
                      key={note.id}
                      data={note.data}
                      id={note.id}
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
