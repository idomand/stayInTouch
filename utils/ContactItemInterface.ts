export interface ContactItemInterface {
  name: string;
  time: number;
  timeFromLastTalk: number;
  notesArray: { data: string; id: number }[] | undefined;
  contactId?: string;
  timeUntilNextTalk?: number;
}
