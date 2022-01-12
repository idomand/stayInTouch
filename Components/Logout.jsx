import React from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { BasicButton } from "./Common/Button";
import FirebaseApp, { auth, provider } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
//*=================
//*=================
//*=================
const LogoutButton = styled(BasicButton)``;

export default function Logout() {
  const { logout } = useAuth();
  function LogoutFunc() {
    logout();
  }

  return <LogoutButton onClick={LogoutFunc}>Logout </LogoutButton>;
}
