import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { deleteNote } from "../lib/Firebase";
import { NoteType } from "../types/NoteType";
import { H4 } from "./Common/StyledText";
import { MinimalButton } from "./Common/StyledButton";

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
  border: solid 1px ${({ theme }) => theme.blue2};
  padding: 5px;
  background-color: ${({ theme }) => theme.grey1};
  overflow: auto;
  width: 380px;
  height: 50px;
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;
const TalkedOnWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.green2};
  padding: 5px;
  background-color: ${({ theme }) => theme.grey1};
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
