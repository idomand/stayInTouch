import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { H1 } from "./Common/Text";
import HowToUse from "./HowToUse";

const MainFormWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const MainHeader = styled(H1)`
  margin: auto;
  padding-top: 10px;
  justify-self: center;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

export default function MainForm() {
  const { currentUser } = useAuth();

  return (
    <>
      <MainFormWrapper>
        <HeaderWrapper>
          <MainHeader>Hi {currentUser.displayName}</MainHeader>
          <HowToUse />
        </HeaderWrapper>
        <AddNewContact />
      </MainFormWrapper>
    </>
  );
}
