export type ContactItemType = {
  name: number;
  time: number;
  timeFromLastTalk: number;
  notesArray: { data: string; noteId: number }[];
  contactId?: string;
  timeUntilNextTalk?: number;
  friendEmail: string;
};
