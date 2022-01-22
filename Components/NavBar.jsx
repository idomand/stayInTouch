import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { NavLink } from "./Common/Links";
import { useMedia } from "react-use";
import { H1 } from "./Common/Text.js";
import useStyledTheme from "../utils/hooks/useStyledTheme";

// !=========================
// ?=========================
// !=========================

const LogoImg = styled.img`
  margin: 5px 0 5px 20px;
  height: 40px;
`;

const NavBarWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.coolBlue};
  position: sticky;
  top: 0;
  width: 100%;
  height: 60px;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const NavbarText = styled(H1)`
  margin-left: 20px;
`;
const ButtonWrapper = styled.div``;

const HomeLink = styled(NavLink)``;

const AboutLink = styled(NavLink)``;

const LoginButton = styled(NavLink)``;

const LogoutButton = styled(NavLink)`
  background-color: ${({ theme }) => theme.boldRed};
  color: ${({ theme }) => theme.black};
`;

export default function NavBar() {
  const Theme = useStyledTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);

  const { currentUser, logout } = useAuth();

  return (
    <NavBarWrapper>
      {isMobile ? (
        <LogoImg src="/telephoneLogo.png" />
      ) : (
        <NavbarText>Staying in Touch!</NavbarText>
      )}

      <ButtonWrapper>
        <HomeLink href="/">Home</HomeLink>
        <AboutLink href="/about">About</AboutLink>
        {currentUser ? (
          <LogoutButton as="button" onClick={logout}>
            Logout
          </LogoutButton>
        ) : (
          <LoginButton href="/login">Login</LoginButton>
        )}
      </ButtonWrapper>
    </NavBarWrapper>
  );
}
