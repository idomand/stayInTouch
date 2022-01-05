import React, { useContext } from "react";
import styled from "styled-components";

import DataContext from "../lib/DataContext";
import { H2 } from "./Common/Text";
import ContactItem from "./ContactItem";

export default function ContactDetails() {
  const contactData = useContext(DataContext);

  const foo = contactData.contactArray;

  return (
    <>
      <H2>this is ContactDetails</H2>
      <ul>
        {contactData.contactArray.map((element) => {
          return <ContactItem key={element.name} name={element.name} />;
        })}
      </ul>
    </>
  );
}
