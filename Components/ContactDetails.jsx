import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";
import { collection, onSnapshot } from "firebase/firestore";

const ContactList = styled.ul`
  padding: 0;
`;

export default function ContactDetails() {
  const [arrayOfContacts, setArrayOfContacts] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `${currentUser.email}${currentUser.uid}`),
      (snapshot) => {
        setArrayOfContacts(
          snapshot.docs.map((doc) => {
            let contactObject = doc.data();
            contactObject.userData.contactId = doc.id;
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
          arrayOfContacts.map(({ userData }) => {
            type++;
            return (
              <ContactItem
                key={userData.contactId}
                name={userData.name}
                time={userData.time}
                timeCreated={userData.timeCreated}
                contactId={userData.contactId}
                type={type}
              />
            );
          })}
      </ContactList>
    </>
  );
}
