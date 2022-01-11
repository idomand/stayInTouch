import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { H2 } from "./Common//Text.js";
import { NavbarButton } from "./Common/Button";
import Logout from "./Logout.jsx";
import { useAuth } from "../lib/AuthContext";

// !=========================
// ?=========================
// !=========================

const NavBarWrapper = styled.nav`
  background-color: ${({ theme }) => theme.subSectionColor};
  position: fixed;
  top: 0;
  width: 100%;
  /* height: 60px; */
  display: flex;
  justify-content: flex-end;
`;
const NevBarText = styled(H2)`
  color: ${({ theme }) => theme.secondaryColor};
`;

export default function NavBar() {
  // const { currentUser } = useAuth();

  return (
    <NavBarWrapper>
      {/* {currentUser && <h1>{currentUser.displayName}</h1>} */}

      {/* <NevBarText>this is the navBar</NevBarText> */}
      {/* <NavBarButton>about the site</NavBarButton> */}
      <Link href="/">home</Link>

      <Link href="/about">about the site</Link>
      <NavbarButton>About the site</NavbarButton>
      <Logout />
      {/* <NavBarButton>Logout</NavBarButton> */}
    </NavBarWrapper>
  );
}
