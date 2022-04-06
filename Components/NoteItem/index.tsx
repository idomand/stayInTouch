import React from "react";
import { useAuth } from "../../lib/AuthContext";
import { deleteNote } from "../../lib/Firebase";
import { H4 } from "../Common/StyledText";
import {
  DeleteNoteButton,
  EditNoteButton,
  NoteDataWrapper,
  NoteItemButtonWrapper,
  NoteItemHeaderText,
  NoteItemHeaderWrapper,
  NoteItemWrapper,
} from "./NoteItemStyle";

export default function NoteItem({ id, data, contactId, switchToEditMood }) {
  const { currentUser } = useAuth();

  function deleteNoteFunc() {
    deleteNote(currentUser.uid, currentUser.email, contactId, id);
  }

  function editNote(data: any, id: any) {
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
