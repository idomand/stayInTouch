import React, { useEffect, useState } from "react";
import ContactItem from "./ContactItem";
import useSnapshotData from "../utils/hooks/useSnapshotData";
import { H1 } from "./Common/StyledText";

import styled from "styled-components";

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

  return (
    <>
      <ContactList>
        {basicArray.length > 0 &&
          arrayOfContacts.map((element) => {
            return (
              <ContactItem
                notesArray={element.notesArray}
                key={element.contactId}
                name={element.name}
                time={element.time}
                timeFromLastTalk={element.timeFromLastTalk}
                contactId={element.contactId}
                tag={element.tag}
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
