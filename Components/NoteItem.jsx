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
  padding: 5px;
  background-color: ${({ theme }) => theme.grey1};
  border: solid 1px ${({ theme }) => theme.blue2};
  border-radius: 10px;
  overflow: auto;
  width: 380px;
  height: 50px;
  font-size: ${({ theme }) => theme.typeScale.p_normal};

  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;

const EditNoteButton = styled(MinimalButton)`
  padding: 3px;
  &:hover,
  &:focus {
    border-radius: 3px;

    color: ${({ theme }) => theme.blue1};
    background: ${({ theme }) => theme.blue3};
  }
`;

const DeleteNoteButton = styled(MinimalButton)`
  margin-left: 15px;
  padding: 3px;
  &:hover,
  &:focus {
    border-radius: 3px;

    background: ${({ theme }) => theme.red2};
    color: ${({ theme }) => theme.red1};
  }
`;

export default function NoteItem({ id, data, contactId, switchToEditMood }) {
  const { currentUser } = useAuth();

  function deleteNoteFunc() {
    deleteNote(currentUser.uid, currentUser.email, contactId, id);
  }

  function editNote() {
    switchToEditMood(data, id);
  }

  return (
    <NoteItemWrapper>
      <NoteItemHeaderWrapper>
        <NoteItemHeaderText>
          <H4>Note Number: #{id}</H4>
        </NoteItemHeaderText>
        <NoteItemButtonWrapper>
          <EditNoteButton onClick={editNote}>Edit</EditNoteButton>
          <DeleteNoteButton onClick={deleteNoteFunc}>Delete</DeleteNoteButton>
        </NoteItemButtonWrapper>
      </NoteItemHeaderWrapper>
      <NoteDataWrapper>{data}</NoteDataWrapper>
    </NoteItemWrapper>
  );
}
