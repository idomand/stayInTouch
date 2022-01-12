import React, { useContext } from "react";
import styled from "styled-components";

import DataContext from "../lib/DataContext";
import ContactItem from "./ContactItem";

const ContactList = styled.ul`
  padding: 0;
`;

export default function ContactDetails() {
  const contactData = useContext(DataContext);

  let type = 0;
  return (
    <>
      <ContactList>
        {contactData.contactArray.map((element) => {
          type++;
          return (
            <ContactItem
              key={element.id}
              name={element.name}
              time={element.time}
              timeCreated={element.timeCreated}
              id={element.id}
              type={type}
            />
          );
        })}
      </ContactList>
    </>
  );
}
