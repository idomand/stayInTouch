import React from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { NavLink } from "./Common/Links";
import { useMedia } from "react-use";
import { H1 } from "./Common/Text.js";
import useStyledTheme from "../utils/hooks/useStyledTheme";
import { useRouter } from "next/router";

//*============================================================================================================
//?============================================================================================================

const LogoImg = styled.img`
  margin: 5px 0 5px 20px;
  height: 40px;
`;

const NavBarWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.boldPurple};
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

const LoginButton = styled(NavLink)``;

const LogoutButton = styled(NavLink)`
  background-color: ${({ theme }) => theme.boldRed};
  color: ${({ theme }) => theme.black};
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function NavBar() {
  const Theme = useStyledTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);
  const { currentUser, logout } = useAuth();

  const router = useRouter();

  return (
    <NavBarWrapper>
      {isMobile ? (
        // <LogoImg src="/telephoneLogo.png" />
        <LogoImg src="/friendsLogo.png" />
      ) : (
        <NavbarText>Staying in Touch!</NavbarText>
      )}

      <ButtonWrapper>
        {currentUser && (
          <NavLink isActive={router.pathname == "/"} href="/">
            Home
          </NavLink>
        )}
        <NavLink isActive={router.pathname == "/about"} href="/about">
          About
        </NavLink>
        {currentUser ? (
          <LogoutButton as="button" onClick={logout}>
            Logout
          </LogoutButton>
        ) : (
          <LoginButton isActive={router.pathname == "/login"} href="/login">
            Login
          </LoginButton>
        )}
      </ButtonWrapper>
    </NavBarWrapper>
  );
}
