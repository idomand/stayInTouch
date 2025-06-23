import React, { useContext, useState, useEffect } from "react";
import { auth, provider } from "./Firebase";
import { signOut, signInWithPopup, User } from "firebase/auth";
import { Result } from "../Components/Common/StyledSpinner";

interface AuthContextInterface {
  currentUser?: User | null;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loading?: boolean;
}

const AuthContext = React.createContext<AuthContextInterface | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setCurrentUser(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  }

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will update the currentUser state
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("User:", user);
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
