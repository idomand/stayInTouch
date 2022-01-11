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
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export default function NavBar() {
  return (
    <NavBarWrapper>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/login">Login</NavLink>
      <Logout />
    </NavBarWrapper>
  );
}
