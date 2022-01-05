import React, { useState } from "react";
import styled from "styled-components";
import AddNewContact from "./AddNewContact";
import { BasicButton } from "./Common/Button";
import { H1 } from "./Common/Text";

const MainFormWrapper = styled.section`
  margin-top: 50px;
`;

const MainFormContent = styled.div`
  color: ${({ theme }) => theme.primaryColorText};
`;

export default function MainForm() {
  const [showContactForm, setShowContactForm] = useState(false);

  function addContactForm() {
    setShowContactForm(true);
  }

  return (
    <MainFormWrapper>
      <H1>Staying in Touch!</H1>
      <BasicButton onClick={addContactForm}>Add New Contact</BasicButton>
      {showContactForm && <AddNewContact />}
    </MainFormWrapper>
  );
}
