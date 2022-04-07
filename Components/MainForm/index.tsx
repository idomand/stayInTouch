import React from "react";
import { useAuth } from "../../lib/AuthContext";
import AddNewContact from "../AddNewContact";
import HowToUse from "../HowToUse";
import { HeaderWrapper, MainFormWrapper, MainHeader } from "./MainFormStyle";

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
