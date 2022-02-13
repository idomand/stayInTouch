import React from "react";
import { useAuth } from "../lib/AuthContext";
import { NavLink } from "./Common/StyledLinks";
import { useMedia } from "react-use";
import { useRouter } from "next/router";
import styled, { useTheme } from "styled-components";
import { H1 } from "./Common/StyledText.js";

const LogoImg = styled.img`
  margin: 5px 0 5px 20px;
  height: 40px;
`;

const NavBarWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.white};
  position: sticky;
  z-index: 2;
  top: 0;
  width: 100%;
  height: 60px;

  box-shadow: 0px 1px 0px #e5e9f2;

  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const NavbarText = styled(H1)`
  margin-left: 80px;
`;

const LoginButton = styled(NavLink)`
  background: ${({ theme }) => theme.blue_1};
  color: ${({ theme }) => theme.white};
  padding: 10px 20px;
  border-radius: 6px;
  border: 1.3px solid ${({ theme }) => theme.white};

  &:hover,
  &:focus {
    background: rgba(44, 97, 224, 0.1);
    border: 1.3px solid ${({ theme }) => theme.blue_1};
    color: ${({ theme }) => theme.blue_1};
  }
`;

const LogoutButton = styled(NavLink)`
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.black};
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
    color: ${({ theme }) => theme.black};
    border: solid 2px ${({ theme }) => theme.black};
  }
`;

const PageLinksWrapper = styled.div`
  font-size: 20px;
`;

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
