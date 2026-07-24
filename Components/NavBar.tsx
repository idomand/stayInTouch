import { useRouter } from "next/router";
import { useState } from "react";
import { useMedia } from "react-use";
import styled, { useTheme } from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { NavLink } from "./Common/StyledLinks";
import { H2 } from "./Common/StyledText";
import SafeCloseDialog from "./SafeCloseDialog";

export default function NavBar() {
  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);
  const { currentUser, logout } = useAuth()!;
  const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);

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
        <>
          <SafeCloseDialog
            dialogText={`Are you sure you want log out`}
            customFunction={logout}
            openDialog={showSafeCloseDialog}
            closeDialog={() => setShowSafeCloseDialog(false)}
          />{" "}
          <LogoutButton
            onClick={() => {
              setShowSafeCloseDialog(true);
            }}
          >
            Log Out
            <LogoutLogo src="/log-out.svg" />
          </LogoutButton>
        </>
      ) : (
        <LoginButton
          as="a"
          isActive={router.pathname == "/login"}
          href="/login"
        >
          Login
        </LoginButton>
      )}
    </NavBarWrapper>
  );
}

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

const NavbarText = styled(H2)`
  margin-left: 40px;
`;

interface LoginButtonProps {
  as: string;
  isActive: boolean;
  href: string;
}

const LoginButton = styled.button<LoginButtonProps>`
  font-size: ${({ theme }) => theme.typeScale.p_small};
  font-weight: 500;
  background: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.sizes.borderRadius};
  border: 1.3px solid ${({ theme }) => theme.white};
  transition: 0.3s all;
  margin: 10px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

const LogoutButton = styled.button`
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: 0.3s all;
  background-color: transparent;
  border: none;
  font-size: ${({ theme }) => theme.typeScale.p_small};
  font-weight: 500;
  color: ${({ theme }) => theme.blue1};
  margin: 10px;
  border-radius: 10px;
  padding: 3px 5px;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.black};
    background: ${({ theme }) => theme.blue3};
  }
`;

const LogoutLogo = styled.img`
  margin-left: 5px;
`;

const PageLinksWrapper = styled.div`
  font-size: 20px;
`;
