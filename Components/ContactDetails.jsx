import React, { useContext } from "react";
import styled from "styled-components";

import DataContext from "../lib/DataContext";
import { H2 } from "./Common/Text";
import ContactItem from "./ContactItem";

const ContactList = styled.ul`
  padding: 0;
`;

export default function ContactDetails() {
  const contactData = useContext(DataContext);

  return (
    <>
      <H2>this is ContactDetails</H2>
      <ContactList>
        {contactData.contactArray.map((element) => {
          return (
            <ContactItem
              key={Math.random()}
              name={element.name}
              time={element.time}
              timeCreated={element.timeCreated}
            />
          );
        })}
      </ContactList>
    </>
  );
}
