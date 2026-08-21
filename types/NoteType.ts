export type NoteType = {
  noteId: number;
  data: string;
  contactId: string;
  switchToEditMood: (oldNoteData: string, OldNoteId: number) => void;
};
