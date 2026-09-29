"use client";

import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { auth, provider } from "@/lib/Firebase";
import { Result } from "@/Components/ui/Spinner";

type AuthContextType = {
  currentUser?: User | null;
  /**
   * True once this tab knows the server session cookie is set. Redirect to a
   * middleware-gated route on this, not on currentUser: the Firebase client can
   * be signed in while the cookie is missing (expired, or still being minted).
   */
  hasSession: boolean;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  checkVerified: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  loading?: boolean;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

const NOT_VERIFIED_MESSAGE = "Please verify your email before signing in.";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  // Firebase's email-enumeration protection reports both a wrong password and
  // an unknown email as invalid-credential, so all three share one message.
  "auth/invalid-credential": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-not-found": "Wrong email or password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/invalid-email": "Please enter a valid email.",
};

/**
 * Turn an error from any auth function into a message for the user. Returns
 * null when the user cancelled on purpose (closed the Google popup), so the UI
 * shows nothing.
 */
export function authErrorMessage(error: unknown): string | null {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    return AUTH_ERROR_MESSAGES[error.code] ?? "Something went wrong. Please try again.";
  }
  // Errors this file throws itself (e.g. postSessionCookie) already carry a
  // user-facing message.
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

/**
 * Mint (or refresh) the httpOnly server session cookie from a fresh ID token.
 * Force-refresh because createSessionCookie requires a token issued within the
 * last five minutes. Callers that navigate afterwards must await this — the
 * middleware gate on "/" rejects a request whose cookie is not yet set.
 */
async function postSessionCookie(user: User) {
  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  // Without a cookie the middleware bounces "/" back to /login, so a failure
  // here must surface to the caller instead of navigating silently.
  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? NOT_VERIFIED_MESSAGE
        :"Could not start your session. Please try again.",
    );
  }
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  /** Every cookie mint goes through here so hasSession stays in step. */
  async function establishSession(user: User) {
    await postSessionCookie(user);
    setHasSession(true);
  }

  async function logout() {
    try {
      // Clear the server session cookie first, then the client SDK session.
      await fetch("/api/auth/session", { method: "DELETE" });
      setHasSession(false);
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
      await establishSession(credential.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  }

  /**
   * Create the account and send the verification email. No session cookie:
   * the user stays signed in on the client only, unverified, until they click
   * the link and call checkVerified.
   */
  async function signUpWithEmail(name: string, email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await sendEmailVerification(credential.user);
  }

  /**
   * An unverified user stays signed in on the client (so the verify screen can
   * resend the email or re-check) but gets no session cookie.
   */
  async function signInWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      throw new Error(NOT_VERIFIED_MESSAGE);
    }
    await establishSession(credential.user);
  }

  async function resendVerification() {
    if (!auth.currentUser) {
      throw new Error("Please sign in again.");
    }
    await sendEmailVerification(auth.currentUser);
  }

  /**
   * Re-read the user after they clicked the email link. postSessionCookie
   * force-refreshes the ID token, so the server sees the new email_verified.
   */
  async function checkVerified() {
    if (!auth.currentUser) {
      throw new Error("Please sign in again.");
    }
    await auth.currentUser.reload();
    if (!auth.currentUser.emailVerified) {
      return false;
    }
    await establishSession(auth.currentUser);
    return true;
  }

  async function sendPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    // Clean up the calendar access token left over from earlier sessions
    localStorage.removeItem("googleAccessToken");

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (!user) {
        setHasSession(false);
      }

      // Refresh the server session cookie on page load/restore so it survives a
      // reload. Fire-and-forget — it must not block rendering. The login flow
      // does not rely on this; loginWithGoogle awaits its own cookie. An
      // unverified user would only get a 403, so skip them.
      if (user?.emailVerified) {
        try {
          await establishSession(user);
        } catch (error) {
          console.error("Error establishing server session:", error);
        }
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    hasSession,
    logout,
    loginWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resendVerification,
    checkVerified,
    sendPasswordReset,
  };
  return (
    <AuthContext.Provider value={value}>
      {loading && <Result />}
      {!loading && children}
    </AuthContext.Provider>
  );
}
