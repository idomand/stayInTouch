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
      const contactArray = await getContactsFromFirestore(
        currentUser.uid,
        currentUser.email
      );
      setArrayOfContacts(contactArray);
    };
    getDataFromFirebase();
  }, [currentUser]);

  let type = 0;

  return (
    <>
      <ContactList>
        {arrayOfContacts &&
          arrayOfContacts.length &&
          arrayOfContacts.map(({ userData }) => {
            console.log("userData :>> ", userData);
            console.log("userData.contactId :>> ", userData.contactId);
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
