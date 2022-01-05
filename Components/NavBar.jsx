import React from "react";
import styled from "styled-components";
import { H2 } from "./Common//Text.js";

const NavBarWrapper = styled.nav`
  background-color: ${({ theme }) => theme.subSectionColor};
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
`;
const NevBarText = styled(H2)`
  color: ${({ theme }) => theme.secondaryColor};
`;

export default function NavBar() {
  return (
    <NavBarWrapper>
      <NevBarText>this is the navBar</NevBarText>
    </NavBarWrapper>
  );
}
