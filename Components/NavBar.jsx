import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { H2 } from "./Common//Text.js";
import { NavbarButton } from "./Common/Button";
import Logout from "./Logout.jsx";
import { useAuth } from "../lib/AuthContext";
import { NavLink } from "./Common/Links";

// !=========================
// ?=========================
// !=========================

const NavBarWrapper = styled.nav`
  background-color: ${({ theme }) => theme.subSectionColor};
  position: sticky;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 50px;
`;

export default function NavBar() {
  const { currentUser } = useAuth();

  return (
    <NavBarWrapper>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/about">About</NavLink>

      {currentUser ? <Logout /> : <NavLink href="/login">Login</NavLink>}
    </NavBarWrapper>
  );
}
