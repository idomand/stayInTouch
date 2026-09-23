"use client";
import { deleteNote } from "@/lib/actions/contacts";
import { H4 } from "@/Components/ui/Text";
import Button from "./ui/Button";

type NoteItemProps = {
  noteId: string;
  body: string;
  contactId: string;
  switchToEditMood: (oldNoteData: string, oldNoteId: string) => void;
};

export default function NoteItem({
  noteId,
  body,
  contactId,
  switchToEditMood,
}: NoteItemProps) {
  async function deleteNoteFunc() {
    const result = await deleteNote(contactId, noteId);
    if (!result.ok) {
      console.error(result.error);
    }
  }

  return (
    <li className="list-none p-1 m-1 flex flex-col">
      <div className="flex justify-between">
        <H4>Note</H4>
        <div className="flex mb-1">
          <Button
            buttonText="Edit"
            onClick={() => switchToEditMood(body, noteId)}
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

      <div className="border border-solid border-blue2 p-1 bg-grey1 overflow-auto w-auto sm:w-95 h-12.5 text-sm">
        {body}
      </div>
    </li>
  );
}
