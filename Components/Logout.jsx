import React from "react";
import styled from "styled-components";
import { signOut } from "firebase/auth";

import FirebaseApp, { auth, provider } from "../lib/Firebase";

//*=================
//*=================
//*=================
const LogOutWrapper = styled.div`
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

  return (
    <LogOutWrapper>
      <button onClick={LogoutFunc}>Logout </button>
    </LogOutWrapper>
  );
}
