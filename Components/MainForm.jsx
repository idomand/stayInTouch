import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { H1 } from "./Common/Text";
import { LinkPrototype } from "./Common/Links";
//*============================================================================================================
//?============================================================================================================

const MainFormWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MainHeader = styled(H1)`
  margin: auto;
  padding-top: 10px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const HowToUseLink = styled(LinkPrototype)`
  text-align: center;

  padding: 10px;
  width: 40px;
  height: 40px;
  margin: 10px;
  margin-right: 60px;
  background-color: ${({ theme }) => theme.white};
  border: solid 2px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  border-radius: 20px;
  transition: all 0.3s ease-in-out;
  &:hover {
    color: ${({ theme }) => theme.white};
    background-color: ${({ theme }) => theme.black};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 5px;
  }
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function MainForm() {
  const { currentUser } = useAuth();

  return (
    <MainFormWrapper>
      <HeaderWrapper>
        <div></div>
        <MainHeader>Hi {currentUser.displayName}</MainHeader>
        {/* <FirstTimeButtonWrapper> */}
        <HowToUseLink href={"/about/#HowToUseSection"}>?</HowToUseLink>
        {/* </FirstTimeButtonWrapper> */}
      </HeaderWrapper>
      <AddNewContact />
    </MainFormWrapper>
  );
}
