import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { auth, provider } from "./Firebase.js";
import {
  signOut,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
} from "firebase/auth";
import { Result } from "../Components/Common/Spinner.js";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  function logout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setCurrentUser(undefined);
      })
      .catch((error) => {
        // An error happened.
      });
  }

  function loginWithGoogle() {
    signInWithRedirect(auth, provider);

    // getRedirectResult(auth)
    //   .then((result) => {
    //     console.log(`result`, result);
    //     // This gives you a Google Access Token. You can use it to access Google APIs.
    //     const credential = GoogleAuthProvider.credentialFromResult(result);
    //     const token = credential.accessToken;
    //     // The signed-in user info.
    //     const user = result.user;

    //     return user;
    //   })

    //   .catch((error) => {
    //     // Handle Errors here.
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // The email of the user's account used.
    //     const email = error.email;
    //     // The AuthCredential type that was used.
    //     const credential = GoogleAuthProvider.credentialFromError(error);
    //     // ...
    //   });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, logout, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {/* <Result /> */}
      {loading && <Result />}
      {!loading && children}
    </AuthContext.Provider>
  );
}
