import React from "react";
import styled from "styled-components";
import {
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
} from "firebase/auth";

import FirebaseApp, { auth, provider } from "../lib/Firebase";

//*=================
//*=================
//*=================
const LoginWrapper = styled.div`
  margin-top: 50px;
`;

export default function Login() {
  async function signInWithGoogle() {
    console.log("%c signInWithGoogle! ", "background: #222; color: #da7055");

    signInWithRedirect(auth, provider);

    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        return user;
      })

      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  return (
    <LoginWrapper>
      <h1>this is the login</h1>
      <button onClick={signInWithGoogle}>SignInWithGoogle </button>
    </LoginWrapper>
  );
}
