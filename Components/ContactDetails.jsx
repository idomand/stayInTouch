import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";
import { collection, onSnapshot } from "firebase/firestore";

const ContactList = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function ContactDetails() {
  const [arrayOfContacts, setArrayOfContacts] = useState([]);
  const { currentUser } = useAuth();
  console.log("arrayOfContacts :>> ", arrayOfContacts);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `${currentUser.email}${currentUser.uid}`),
      (snapshot) => {
        setArrayOfContacts(
          snapshot.docs.map((doc) => {
            let contactObject = doc.data();
            contactObject.contactId = doc.id;
            return contactObject;
          })
        );
      }
    );
    return unsubscribe;
  }, [currentUser]);

  let type = 0;

  return (
    <>
      <ContactList>
        {arrayOfContacts &&
          arrayOfContacts.length &&
          arrayOfContacts.map((element) => {
            type++;
            return (
              <ContactItem
                key={element.contactId}
                name={element.name}
                time={element.time}
                timeCreated={element.timeCreated}
                contactId={element.contactId}
                type={type}
              />
            );
          })}
        {arrayOfContacts.length === 0 && <h1>no contacts</h1>}
      </ContactList>
    </>
  );
}
