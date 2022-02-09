import React, { useEffect, useState } from "react";
import ContactItem from "../ContactItem";
import useSnapshotData from "../../utils/hooks/useSnapshotData";
import { ContactList, NoContactsWrapper } from "./ContactDetailsStyle";
import { H1 } from "../Common/StyledText";

export default function ContactDetails() {
  const [arrayOfContacts, SetArrayOfContacts] = useState([]);

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

  let type = 0;

  return (
    <>
      <ContactList>
        {basicArray.length > 0 &&
          arrayOfContacts.map((element) => {
            type++;
            return (
              <ContactItem
                key={element.contactId}
                name={element.name}
                time={element.time}
                timeFromLastTalk={element.timeFromLastTalk}
                contactId={element.contactId}
                type={type}
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
