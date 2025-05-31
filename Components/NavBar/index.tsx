import React, { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { NavLink } from "../Common/StyledLinks";
import { useMedia } from "react-use";
import { useRouter } from "next/router";
import { useTheme } from "styled-components";
import {
  LoginButton,
  LogoImg,
  LogoutButton,
  LogoutLogo,
  NavbarText,
  NavBarWrapper,
  PageLinksWrapper,
} from "./NavBarStyle";
import SafeCloseDialog from "../SafeCloseDialog";

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
