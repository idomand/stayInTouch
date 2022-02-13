import React from "react";
import { useAuth } from "../../lib/AuthContext";
import { NavLink } from "../Common/StyledLinks";
import { useMedia } from "react-use";
import { useRouter } from "next/router";
import { useTheme } from "styled-components";
import {
  LoginButton,
  LogoImg,
  LogoutButton,
  NavbarText,
  NavBarWrapper,
  PageLinksWrapper,
} from "./NavBarStyle";

export default function NavBar() {
  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);
  const { currentUser, logout } = useAuth();

  const router = useRouter();

  return (
    <NavBarWrapper>
      {isMobile ? (
        <LogoImg src="/friendsLogo.png" />
      ) : (
        <NavbarText>Stay-in-Touch!</NavbarText>
      )}
      <PageLinksWrapper>
        {currentUser && (
          <NavLink isActive={router.pathname == "/"} href="/">
            Home
          </NavLink>
        )}
        <NavLink isActive={router.pathname == "/about"} href="/about">
          About
        </NavLink>
      </PageLinksWrapper>

      {currentUser ? (
        <LogoutButton as="button" onClick={logout}>
          Logout
        </LogoutButton>
      ) : (
        <LoginButton isActive={router.pathname == "/login"} href="/login">
          Login
        </LoginButton>
      )}
    </NavBarWrapper>
  );
}
