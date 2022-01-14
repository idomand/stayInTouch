import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getContactsFromFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";

const ContactList = styled.ul`
  padding: 0;
`;

export default function ContactDetails() {
  const [arrayOfContacts, setArrayOfContacts] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const getDataFromFirebase = async () => {
      const contactArray = await getContactsFromFirestore(currentUser.uid);
      setArrayOfContacts(contactArray);
    };
    getDataFromFirebase();
  }, [currentUser.uid]);

  let type = 0;

  return (
    <>
      <ContactList>
        {arrayOfContacts.length &&
          arrayOfContacts.map(({ userData }) => {
            type++;
            return (
              <ContactItem
                key={userData.contactId}
                name={userData.name}
                time={userData.time}
                timeCreated={userData.timeCreated}
                id={userData.contactId}
                type={type}
              />
            );
          })}
      </ContactList>
    </>
  );
}
