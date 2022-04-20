export interface ContactItemInterface {
  name: string;
  time: number;
  timeFromLastTalk: number;
  notesArray: { data: string; noteId: number }[] | undefined;
  contactId?: string;
  timeUntilNextTalk?: number;
}
