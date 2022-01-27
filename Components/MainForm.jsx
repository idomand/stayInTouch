import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { H1 } from "./Common/Text";

const MainFormWrapper = styled.section`
  /* margin-top: 50px; */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MainHeader = styled(H1)`
  margin: auto;
  padding-top: 10px;
`;

export default function MainForm() {
  const { currentUser } = useAuth();

  return (
    <MainFormWrapper>
      <MainHeader>Hi {currentUser.displayName}</MainHeader>
      <AddNewContact />
    </MainFormWrapper>
  );
}
