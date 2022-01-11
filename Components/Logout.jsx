import React from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { BasicButton } from "./Common/Button";
import FirebaseApp, { auth, provider } from "../lib/Firebase";

//*=================
//*=================
//*=================
const LogoutButton = styled(BasicButton)`
  /* margin-top: 50px; */
`;

export default function Logout() {
  function LogoutFunc() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("user is signed out");
      })
      .catch((error) => {
        // An error happened.
      });
  }

  return <LogoutButton onClick={LogoutFunc}>Logout </LogoutButton>;
}
