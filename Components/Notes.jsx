import React, { useState } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import { H5 } from "./Common/StyledText";
import { BasicButton } from "./Common/StyledButton";
import { BasicForm, InputSubmit } from "./Common/StyledFormElements";
import NoteItem from "./NoteItem";

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
  padding: 25px;
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
`;

const NewNoteSubmit = styled(InputSubmit)`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  margin: 5px auto;
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
  border: solid red;
  padding: 0;
`;

export default function Notes({ name, notesArrayData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notesArray, setNotesArray] = useState(notesArrayData);

  function onCloseModal() {
    setIsModalOpen(false);
  }

  function onOpenModal(e) {
    setIsModalOpen(true);
    e.currentTarget.blur();
  }

  return (
    <>
      {notesArrayData && notesArrayData.length ? (
        <>
          <NotesButton onClick={onOpenModal}>
            <NotsNumber>{notesArrayData.length}</NotsNumber>
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
            <AddNewNoteForm>
              <NewNoteInput
                placeholder="Enter Note (optional)"
                value={newNote}
                onChange={(e) => {
                  setNewNote(e.target.value);
                }}
              />
              <NewNoteSubmit value="Add Note" type="submit" />
            </AddNewNoteForm>
          </AddNewNoteWrapper>
          <NotesListWrapper>
            <NotesList>
              {notesArrayData &&
                notesArrayData.length &&
                notesArray.map((note) => {
                  return <NoteItem key={note.id} data={note} id={note.id} />;
                })}
            </NotesList>
          </NotesListWrapper>
        </NotesWrapper>
      </ReactModal>
    </>
  );
}
