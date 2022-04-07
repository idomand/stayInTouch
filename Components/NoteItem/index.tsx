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

type Props = {
  noteId: number;
  data: string;
  contactId: string;
  switchToEditMood: any;
};

export default function NoteItem({
  noteId,
  data,
  contactId,
  switchToEditMood,
}: Props) {
  const { currentUser } = useAuth();

  function deleteNoteFunc() {
    deleteNote(currentUser.uid, currentUser.email, contactId, noteId);
  }

  return (
    <NoteItemWrapper>
      <NoteItemHeaderWrapper>
        <NoteItemHeaderText>
          <H4>Note Number: #{noteId}</H4>
        </NoteItemHeaderText>
        <NoteItemButtonWrapper>
          <EditNoteButton onClick={() => switchToEditMood(data, noteId)}>
            Edit
          </EditNoteButton>
          <DeleteNoteButton onClick={deleteNoteFunc}>Delete</DeleteNoteButton>
        </NoteItemButtonWrapper>
      </NoteItemHeaderWrapper>
      <NoteDataWrapper>{data}</NoteDataWrapper>
    </NoteItemWrapper>
  );
}
