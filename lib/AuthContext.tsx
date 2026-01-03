import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { Result } from "../Components/Common/StyledSpinner";
import { auth, provider } from "./Firebase";

interface AuthContextInterface {
  currentUser?: User | null;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loading?: boolean;
  googleAccessToken?: string | null;
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
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );

  function logout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setCurrentUser(null);
        setGoogleAccessToken(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  }

  async function loginWithGoogle() {
    try {
      // Add Google Calendar scope to request calendar permissions
      provider.addScope("https://www.googleapis.com/auth/calendar.events");
      const result = await signInWithPopup(auth, provider);

      // Get the OAuth access token from the credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (accessToken) {
        setGoogleAccessToken(accessToken);
        // Store in localStorage for persistence
        localStorage.setItem("googleAccessToken", accessToken);
      }
      // The onAuthStateChanged listener will update the currentUser state
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  }

  useEffect(() => {
    // Try to restore access token from localStorage
    const storedToken = localStorage.getItem("googleAccessToken");
    if (storedToken) {
      setGoogleAccessToken(storedToken);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("User:", user);
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, logout, loginWithGoogle, googleAccessToken };

  return (
    <AuthContext.Provider value={value}>
      {loading && <Result />}
      {!loading && children}
    </AuthContext.Provider>
  );
}
