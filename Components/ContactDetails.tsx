import { useEffect, useState } from "react";
import styled from "styled-components";
import useSnapshotData from "../utils/hooks/useSnapshotData";
import { H1 } from "./Common/StyledText";
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

const ContactList = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const NoContactsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
