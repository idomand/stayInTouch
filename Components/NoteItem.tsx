import { useAuth } from "../lib/AuthContext";
import { deleteNote } from "../lib/Firebase";
import { NoteType } from "../types/NoteType";
import { H4 } from "@/Components/ui/Text";
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
    <li className="list-none p-1 m-1 flex flex-col">
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
        <div className="border border-solid border-green2 p-1 bg-grey1 overflow-auto w-auto sm:w-95 h-12.5 text-sm">
          {data}
        </div>
      ) : (
        <div className="border border-solid border-blue2 p-1 bg-grey1 overflow-auto w-auto sm:w-95 h-12.5 text-sm">
          {data}
        </div>
      )}
    </li>
  );
}
