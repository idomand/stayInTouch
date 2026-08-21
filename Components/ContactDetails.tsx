import { useEffect, useState } from "react";
import useSnapshotData from "../utils/hooks/useSnapshotData";
import { H1 } from "@/Components/ui/Text";
import ContactItem from "./ContactItem";
import { ContactItemType } from "@/types/ContactItemType";

export default function ContactDetails() {
  const [arrayOfContacts, SetArrayOfContacts] = useState<ContactItemType[]>([]);

  const basicArray = useSnapshotData();

  useEffect(() => {
    let newArray = basicArray.sort((a, b) => {
      if (a.timeUntilNextTalk! > b.timeUntilNextTalk!) {
        return 1;
      } else {
        return -1;
      }
    });
    SetArrayOfContacts(newArray);
  }, [basicArray]);

  return (
    <>
      <ul className="p-0 flex flex-col items-center relative">
        {basicArray.length > 0 &&
          arrayOfContacts.map((element: ContactItemType) => {
            return (
              <ContactItem
                notesArray={element.notesArray}
                key={element.contactId}
                name={element.name}
                time={element.time}
                timeFromLastTalk={element.timeFromLastTalk}
                contactId={element.contactId}
                timeUntilNextTalk={element.timeUntilNextTalk}
                friendEmail={element.friendEmail}
              />
            );
          })}
      </ul>
      {basicArray.length === 0 && (
        <div className="flex justify-center">
          <H1>no contacts</H1>
        </div>
      )}
    </>
  );
}
