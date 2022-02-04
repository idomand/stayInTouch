import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";
import { collection, onSnapshot } from "firebase/firestore";
import { H1 } from "./Common/Text";
//*============================================================================================================
//?============================================================================================================

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

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function ContactDetails() {
  const [arrayOfContacts, setArrayOfContacts] = useState([]);
  const { currentUser } = useAuth();

  const oneDay = 86400000;
  const currantTime = new Date().getTime();

  console.log("arrayOfContacts :>> ", arrayOfContacts);

  /* 
//* the order needs to be "c" "b" "a" "d"
*/

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `${currentUser.email}${currentUser.uid}`),
      (snapshot) => {
        setArrayOfContacts(
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
        setArrayOfContacts((oldArray) => {
          console.log("oldArray :>> ", oldArray);
          return oldArray.sort((a, b) => {
            return a.timeUntilNextTalk - b.timeUntilNextTalk;
          });
        });
      }
    );
    return unsubscribe;
  }, [currentUser]);

  //!===========working useEffect - start====================================
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(
  //     collection(db, `${currentUser.email}${currentUser.uid}`),
  //     (snapshot) => {
  //       setArrayOfContacts(
  //         snapshot.docs.map((doc) => {
  //           let contactObject = doc.data();
  //           contactObject.contactId = doc.id;
  //           return contactObject;
  //         })
  //       );
  //     }
  //   );
  //   return unsubscribe;
  // }, [currentUser]);
  //!===========working useEffect - end====================================

  let type = 0;

  return (
    <>
      <ContactList>
        {arrayOfContacts.length > 0 &&
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
      {arrayOfContacts.length === 0 && (
        <NoContactsWrapper>
          <H1>no contacts</H1>
        </NoContactsWrapper>
      )}
    </>
  );
}
