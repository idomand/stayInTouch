"use client";

import { signInWithPopup, signOut, User } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth, provider } from "@/lib/Firebase";
import { Result } from "@/Components/ui/Spinner";

type AuthContextType = {
  currentUser?: User | null;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loading?: boolean;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

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

  async function logout() {
    try {
      // Clear the server session cookie first, then the client SDK session.
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will update the currentUser state
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  }

  useEffect(() => {
    // Clean up the calendar access token left over from earlier sessions
    localStorage.removeItem("googleAccessToken");

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);

      // Mint (or refresh) the server session cookie so Server Components and
      // Server Actions know the uid. Force-refresh the token: createSessionCookie
      // needs one issued within the last five minutes, which a cached token on a
      // page reload may not be. Fire-and-forget — it must not block rendering.
      if (user) {
        try {
          const idToken = await user.getIdToken(true);
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error("Error establishing server session:", error);
        }
      }
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
