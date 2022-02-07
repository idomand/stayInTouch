import React, { useContext, useState, useEffect } from "react";
import { auth, provider } from "./Firebase.js";
import { signOut, signInWithRedirect } from "firebase/auth";
import { Result } from "../Components/Common/Spinner.js";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  function logout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setCurrentUser(undefined);
      })
      .catch((error) => {
        console.log(`error`, error);
      });
  }

  function loginWithGoogle() {
    signInWithRedirect(auth, provider);
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
      {loading && <Result />}
      {!loading && children}
    </AuthContext.Provider>
  );
}
