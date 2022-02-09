import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";
import { collection, onSnapshot } from "firebase/firestore";
import { H1 } from "./Common/StyledText";
import { oneDay } from "../lib/ConstantsFile";

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
  const [basicArray, SetBasicArray] = useState([]);
  const [arrayOfContacts, SetArrayOfContacts] = useState([]);
  const { currentUser } = useAuth();

  const currantTime = new Date().getTime();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `${currentUser.email}${currentUser.uid}`),
      (snapshot) => {
        SetBasicArray(
          snapshot.docs.map((doc) => {
            let contactObject = doc.data();
            contactObject.contactId = doc.id;
            contactObject.timeUntilNextTalk = +(
              contactObject.time -
              (currantTime - contactObject.timeFromLastTalk) / oneDay
            ).toFixed(1);
            return contactObject;
          })
        );
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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
