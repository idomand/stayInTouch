import React, { useEffect, useState } from "react";
import ContactItem from "../ContactItem";
import useSnapshotData from "../../utils/hooks/useSnapshotData";
import { ContactList, NoContactsWrapper } from "./ContactDetailsStyle";
import { H1 } from "../Common/StyledText";
import { ContactItemInterface } from "../../utils/ContactItemInterface";

export default function ContactDetails() {
  const [arrayOfContacts, SetArrayOfContacts] = useState<
    ContactItemInterface[]
  >([]);

  const basicArray = useSnapshotData();

  useEffect(() => {
    let newArray = basicArray.sort((a, b) => {
      if (a.timeUntilNextTalk > b.timeUntilNextTalk) {
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
          arrayOfContacts.map((element: ContactItemInterface) => {
            return (
              <ContactItem
                notesArray={element.notesArray}
                key={element.contactId}
                name={element.name}
                time={element.time}
                timeFromLastTalk={element.timeFromLastTalk}
                contactId={element.contactId}
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
