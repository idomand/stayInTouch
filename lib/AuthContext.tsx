"use client";

import { signInWithPopup, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
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

/**
 * Mint (or refresh) the httpOnly server session cookie from a fresh ID token.
 * Force-refresh because createSessionCookie requires a token issued within the
 * last five minutes. Callers that navigate afterwards must await this — the
 * middleware gate on "/" rejects a request whose cookie is not yet set.
 */
async function postSessionCookie(user: User) {
  const idToken = await user.getIdToken(true);
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function logout() {
    try {
      // Clear the server session cookie first, then the client SDK session.
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      setCurrentUser(null);
      // The home page is server-rendered now, so clearing state does not move
      // the user off it — navigate, and refresh so no cached authed view remains.
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function loginWithGoogle() {
    try {
      const credential = await signInWithPopup(auth, provider);
      // Await the cookie here so callers can navigate straight to a middleware-
      // gated route without racing the fire-and-forget listener below.
      await postSessionCookie(credential.user);
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

      // Refresh the server session cookie on page load/restore so it survives a
      // reload. Fire-and-forget — it must not block rendering. The login flow
      // does not rely on this; loginWithGoogle awaits its own cookie.
      if (user) {
        try {
          await postSessionCookie(user);
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
