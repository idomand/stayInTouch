import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { H1 } from "./Common/Text";

const MainFormWrapper = styled.section`
  margin-top: 50px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const MainHeader = styled(H1)`
  margin: auto;
  padding-top: 10px;
`;

export default function MainForm() {
  const { currentUser } = useAuth();

  return (
    <MainFormWrapper>
      <HeaderWrapper>
        {/* <MainHeader>Staying in Touch!</MainHeader> */}
        <MainHeader>Hi {currentUser.displayName}</MainHeader>
      </HeaderWrapper>
      <AddNewContact />
    </MainFormWrapper>
  );
}
