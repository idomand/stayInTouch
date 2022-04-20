import React, { useContext, useState, useEffect } from "react";
import { auth, provider } from "./Firebase";
import { signOut, signInWithRedirect, User } from "firebase/auth";
import { Result } from "../Components/Common/StyledSpinner";

interface AuthContextInterface {
  currentUser?: User | null;
  logout: any;
  loginWithGoogle: any;
  loading?: boolean;
}

const AuthContext = React.createContext<AuthContextInterface | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setCurrentUser(null);
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
      console.log("user :>> ", user);
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
