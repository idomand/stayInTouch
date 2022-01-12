import React from "react";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
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
