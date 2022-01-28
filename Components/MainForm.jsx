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

const HowToUseLink = styled(LinkPrototype)`
  text-align: center;
  font-size: ${({ theme }) => theme.typeScale.header2};
  padding: 5px;
  width: 40px;
  height: 40px;
  margin: 10px;
  margin-right: 60px;
  background-color: ${({ theme }) => theme.white};
  border: solid 1px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  border-radius: 20px;
  transition: all 0.3s;
  &:hover {
    color: ${({ theme }) => theme.black};
    background-color: ${({ theme }) => theme.brown1};
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
    <>
      <MainFormWrapper>
        <HeaderWrapper>
          <MainHeader>Hi {currentUser.displayName}</MainHeader>
          {/* <FirstTimeButtonWrapper> */}
          <HowToUseLink href={"/about/#HowToUseSection"}>?</HowToUseLink>
          {/* </FirstTimeButtonWrapper> */}
        </HeaderWrapper>
        <AddNewContact />
      </MainFormWrapper>
    </>
  );
}
