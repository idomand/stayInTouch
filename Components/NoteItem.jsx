import React from "react";
import styled from "styled-components";
import { MinimalButton } from "./Common/StyledButton";
import { H4 } from "./Common/StyledText";
import { useAuth } from "../lib/AuthContext";
import { deleteNote } from "../lib/Firebase";
const NoteItemWrapper = styled.li`
  list-style-type: none;
  padding: 5px;
  margin: 5px;
  display: flex;
  flex-direction: column;
`;

const NoteItemHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const NoteItemHeaderText = styled.div``;

const NoteItemButtonWrapper = styled.div``;

const NoteDataWrapper = styled.div`
  padding: 10px;

  background-color: ${({ theme }) => theme.grey1};
  border: solid 1px ${({ theme }) => theme.blue2};
  border-radius: 10px;
  width: 415px;
  height: 73px;
`;

const EditNoteButton = styled(MinimalButton)``;

const DeleteNoteButton = styled(MinimalButton)`
  margin-left: 15px;
`;

export default function NoteItem({ id, data, contactId }) {
  const { currentUser } = useAuth();

  function deleteNoteFunc() {
    deleteNote(currentUser.uid, currentUser.email, contactId, id);
  }

  function editNote() {}

  return (
    <NoteItemWrapper>
      <NoteItemHeaderWrapper>
        <NoteItemHeaderText>
          <H4>Note Number: #{id}</H4>
        </NoteItemHeaderText>
        <NoteItemButtonWrapper>
          <EditNoteButton>Edit</EditNoteButton>
          <DeleteNoteButton onClick={deleteNoteFunc}>Delete</DeleteNoteButton>
        </NoteItemButtonWrapper>
      </NoteItemHeaderWrapper>
      <NoteDataWrapper>{data}</NoteDataWrapper>
    </NoteItemWrapper>
  );
}
