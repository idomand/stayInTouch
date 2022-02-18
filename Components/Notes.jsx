import React, { useState } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import { H5 } from "./Common/StyledText";
import { BasicButton } from "./Common/StyledButton";
import { BasicForm, InputSubmit } from "./Common/StyledFormElements";
import NoteItem from "./NoteItem";
import { updateContact, updateNote } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";

const NotesButton = styled.button`
  cursor: pointer;
  height: 40px;
  background-color: ${({ theme }) => theme.blue3};
  border: none;
  border-radius: 55px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.grey2};
  }
`;

const NotsNumber = styled.div`
  border-radius: 38px;
  text-align: center;
  font-weight: 600;
  height: 18px;
  width: 18px;
  position: absolute;
  bottom: 25px;
  left: 30px;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  transition: all 0.3s;
  border: solid 1px transparent;
  ${NotesButton}:hover &,
  ${NotesButton}:focus & {
    background-color: ${({ theme }) => theme.white};
    border: solid 1px ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

const NotesLogo = styled.img`
  display: block;
  margin-left: 5px;
`;

const NotesWrapper = styled.section``;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 25px;
`;
const ContactNameWrapper = styled.div`
  display: flex;
  margin: auto;
`;

const ContactNameText = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;
const CloseModalButton = styled(BasicButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.black};
  border: none;
  font-size: larger;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue3};
    border: none;
  }
`;

const AddNewNoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AddNewNoteForm = styled(BasicForm)`
  display: flex;
  flex-direction: column;
`;

const NewNoteInput = styled.textarea`
  background-color: ${({ theme }) => theme.grey1};
  border-radius: 10px;
  padding: 10px;
  width: 415px;
  height: 73px;

  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;

const ChancelEditButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  /* margin: 5px auto; */
  padding: 10px 15px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

const NotesButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const NewNoteSubmit = styled(InputSubmit)`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  padding: 10px 15px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;
const NotesListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NotesList = styled.ul`
  padding: 0;
  margin: 0;
`;

export default function Notes(props) {
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
