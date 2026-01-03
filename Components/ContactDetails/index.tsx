import { useEffect, useState } from "react";
import { ContactItemType } from "../../types/ContactItemType";
import useSnapshotData from "../../utils/hooks/useSnapshotData";
import { H1 } from "../Common/StyledText";
import ContactItem from "../ContactItem";
import { ContactList, NoContactsWrapper } from "./ContactDetailsStyle";

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
      <ContactList>
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
      </ContactList>
      {basicArray.length === 0 && (
        <NoContactsWrapper>
          <H1>no contacts</H1>
        </NoContactsWrapper>
      )}
    </>
  );
}
