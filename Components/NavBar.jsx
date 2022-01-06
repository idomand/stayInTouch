import React from "react";
import styled from "styled-components";
import { H2 } from "./Common//Text.js";
import { BasicButton } from "./Common/Button";

const NavBarWrapper = styled.nav`
  background-color: ${({ theme }) => theme.subSectionColor};
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: flex-end;
`;
const NevBarText = styled(H2)`
  color: ${({ theme }) => theme.secondaryColor};
`;

const NavBarButton = styled(BasicButton)`
  color: ${({ theme }) => theme.secondaryColor};
  margin: 3px;
  background-color: lightgreen;
`;

export default function NavBar() {
  return (
    <NavBarWrapper>
      {/* <NevBarText>this is the navBar</NevBarText> */}
      {/* <NavBarButton>about the site</NavBarButton> */}
      <NavBarButton>about the site</NavBarButton>
      <NavBarButton>Logout</NavBarButton>
    </NavBarWrapper>
  );
}
