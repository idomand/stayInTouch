import React, { useContext } from "react";
import styled from "styled-components";
import DataContext from "../lib/DataContext";

const ContactItemWrapper = styled.li`
  list-style-type: none;
`;

export default function ContactItem({ name, time }) {
  const contactData = useContext(DataContext);
  return (
    <ContactItemWrapper>
      <h3>
        the name is: {name} and the time is {time}
      </h3>
    </ContactItemWrapper>
  );
}
