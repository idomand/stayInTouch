export interface ContactItemInterface {
  notesArray: { data: string; id: number }[] | undefined;
  contactId: string;
  name: string;
  time: number;
  timeFromLastTalk: number;
  timeUntilNextTalk: number;
}
