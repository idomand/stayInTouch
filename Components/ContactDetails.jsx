import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getContactsFromFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ContactItem from "./ContactItem";

const ContactList = styled.ul`
  padding: 0;
`;

const DUMMY_DATA = [
  {
    userData: {
      name: "Dana",
      time: 3,
      timeCreated: 1641227473000,
      contactId: 5,
    },
  },
  {
    userData: {
      name: "Asaf",
      time: 5,
      timeCreated: 1641118511111,
      contactId: 1,
    },
  },
];

export default function ContactDetails() {
  const [arrayOfContacts, setArrayOfContacts] = useState(DUMMY_DATA);
  const { currentUser } = useAuth();

  // useEffect(() => {
  //   const getDataFromFirebase = async () => {
  //     const contactArray = await getContactsFromFirestore(
  //       currentUser.uid,
  //       currentUser.email
  //     );
  //     setArrayOfContacts(contactArray);
  //   };
  //   getDataFromFirebase();
  // }, [currentUser, arrayOfContacts]);

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
