import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { deleteNote } from "../lib/Firebase";
import { NoteType } from "../types/NoteType";
import { H4 } from "./Common/StyledText";
import Button from "./ui/Button";

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
      <div className="flex justify-between">
        <H4>Note Number: #{noteId}</H4>
        <div className="flex mb-1">
          <Button
            buttonText="Edit"
            onClick={() => switchToEditMood(data, noteId)}
            variant="Secondary"
            extraClasses="mr-1 hover:bg-blue3 hover:text-blue1"
          />
          <Button
            buttonText="Delete"
            onClick={deleteNoteFunc}
            variant="Secondary"
            extraClasses="hover:bg-red2 hover:text-red1"
          />
        </div>
      </div>

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
