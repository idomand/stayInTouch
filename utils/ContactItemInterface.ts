export interface ContactItemInterface {
  name: string;
  time: number;
  timeFromLastTalk: number;
  notesArray: { data: string; noteId: number }[];
  contactId?: string;
  timeUntilNextTalk?: number;
}
