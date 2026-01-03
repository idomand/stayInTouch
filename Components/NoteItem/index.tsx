import { useAuth } from "../../lib/AuthContext";
import { deleteNote } from "../../lib/Firebase";
import { NoteType } from "../../types/NoteType";
import { H4 } from "../Common/StyledText";
import {
  DeleteNoteButton,
  EditNoteButton,
  NoteDataWrapper,
  NoteItemButtonWrapper,
  NoteItemHeaderText,
  NoteItemHeaderWrapper,
  NoteItemWrapper,
  TalkedOnWrapper,
} from "./NoteItemStyles";

export default function NoteItem({
  noteId,
  data,
  contactId,
  switchToEditMood,
}: NoteType) {
  const { currentUser } = useAuth()!;

  function deleteNoteFunc() {
    if (currentUser == null || currentUser.email == null) return;
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

      {data.startsWith("Talked on: ") ? (
        <TalkedOnWrapper>{data}</TalkedOnWrapper>
      ) : (
        <NoteDataWrapper>{data}</NoteDataWrapper>
      )}
    </NoteItemWrapper>
  );
}
