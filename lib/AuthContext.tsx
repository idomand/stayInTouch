"use client";

import { FirebaseError } from "firebase/app";
import {
  Auth,
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
import type { Messages, useTranslations } from "next-intl";
import React, { useContext, useEffect, useState } from "react";
import { auth, provider } from "@/lib/Firebase";
import { deleteAccount as deleteAccountAction } from "@/lib/actions/account";
import type { ActionResult } from "@/lib/actions/validation";
import { Result } from "@/Components/ui/Spinner";

type AuthContextType = {
  currentUser?: User | null;
  /**
   * True once this tab knows the server session cookie is set. Redirect to a
   * proxy-gated route on this, not on currentUser: the Firebase client can
   * be signed in while the cookie is missing (expired, or still being minted).
   */
  hasSession: boolean;
  /** Renew the cookie, or clear hasSession if the server no longer accepts it. */
  refreshSession: () => Promise<boolean>;
  logout: () => void;
  /** Deletes the account and all its data, then signs out on success. */
  deleteAccount: () => Promise<ActionResult>;
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

type AuthErrorKey = keyof Messages["authErrors"];

/** The root translator, useTranslations(); keys are read under "authErrors". */
export type AuthErrorTranslator = ReturnType<typeof useTranslations<never>>;

/**
 * A user-facing error this file throws. It carries a message key, not text,
 * because translation happens in the component that shows it.
 */
class AuthMessageError extends Error {
  constructor(readonly key: AuthErrorKey) {
    super(key);
  }
}

const AUTH_ERROR_KEYS: Record<string, AuthErrorKey> = {
  "auth/email-already-in-use": "emailInUse",
  // Firebase's email-enumeration protection reports both a wrong password and
  // an unknown email as invalid-credential, so all three share one message.
  "auth/invalid-credential": "wrongCredentials",
  "auth/wrong-password": "wrongCredentials",
  "auth/user-not-found": "wrongCredentials",
  "auth/weak-password": "weakPassword",
  "auth/too-many-requests": "tooManyRequests",
  "auth/invalid-email": "invalidEmail",
};

/**
 * Turn an error from any auth function into a message for the user. Returns
 * null when the user cancelled on purpose (closed the Google popup), so the UI
 * shows nothing.
 */
export function authErrorMessage(
  error: unknown,
  t: AuthErrorTranslator,
): string | null {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    return t(`authErrors.${AUTH_ERROR_KEYS[error.code] ?? "generic"}`);
  }
  if (error instanceof AuthMessageError) {
    return t(`authErrors.${error.key}`);
  }
  return t("authErrors.generic");
}

/** Below createSessionCookie's five-minute limit, with a margin for clock skew. */
const FRESH_TOKEN_MAX_AGE_MS = 4 * 60 * 1000;

/**
 * Mint (or refresh) the httpOnly server session cookie from a fresh ID token.
 * createSessionCookie requires a token issued within the last five minutes, so
 * force a refresh only for an older one; right after sign-in the token is
 * seconds old and the refresh would be a wasted round trip. Callers that
 * navigate afterwards must await this — the proxy gate on "/" rejects a
 * request whose cookie is not yet set.
 */
async function postSessionCookie(user: User) {
  const { issuedAtTime } = await user.getIdTokenResult();
  const isTokenFresh =
    Date.now() - Date.parse(issuedAtTime) < FRESH_TOKEN_MAX_AGE_MS;
  const idToken = await user.getIdToken(!isTokenFresh);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  // Without a cookie the proxy bounces "/" back to /login, so a failure
  // here must surface to the caller instead of navigating silently.
  if (!response.ok) {
    throw new AuthMessageError(
      response.status === 403 ? "notVerified" : "sessionFailed",
    );
  }
}

/**
 * Firebase loads a hidden iframe before it opens the Google popup. On desktop
 * Chrome it does this on the first click, which delayed the popup by seconds.
 * Start it early. `_popupRedirectResolver._initialize` is internal Firebase
 * API: if an upgrade removes it, this does nothing and sign-in still works,
 * just slower. Firebase caches the result, so repeat calls are free.
 */
function warmUpPopupSignIn() {
  const resolver = (
    auth as unknown as {
      _popupRedirectResolver?: {
        _initialize?: (auth: Auth) => Promise<unknown>;
      };
    }
  )._popupRedirectResolver;
  resolver?._initialize?.(auth).catch((error) => {
    console.error("Could not prepare Google sign-in:", error);
  });
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

  /**
   * Re-check a session this tab believes it has. The server can reject the
   * cookie while hasSession stays true (logout on another device revokes it,
   * or it expires), and /login would then send the user back to "/" in a loop.
   * Re-minting either renews the cookie or fails; a failure clears hasSession.
   */
  async function refreshSession() {
    if (!auth.currentUser) {
      setHasSession(false);
      return false;
    }
    try {
      await establishSession(auth.currentUser);
      return true;
    } catch (error) {
      console.error("Error refreshing server session:", error);
      setHasSession(false);
      return false;
    }
  }

  /** Client half of signing out, once the server cookie is already gone. */
  async function finishSignOut() {
    setHasSession(false);
    await signOut(auth);
    setCurrentUser(null);
    // The home page is server-rendered now, so clearing state does not move
    // the user off it — navigate, and refresh so no cached authed view remains.
    router.replace("/login");
    router.refresh();
  }

  async function logout() {
    try {
      // Clear the server session cookie first, then the client SDK session.
      await fetch("/api/auth/session", { method: "DELETE" });
      await finishSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /** The Server Action deletes the data, the user and the cookie. */
  async function deleteAccount(): Promise<ActionResult> {
    const result = await deleteAccountAction();
    if (result.ok) {
      await finishSignOut();
    }
    return result;
  }

  async function loginWithGoogle() {
    try {
      const credential = await signInWithPopup(auth, provider);
      // Await the cookie here so callers can navigate straight to a proxy-
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
      throw new AuthMessageError("notVerified");
    }
    await establishSession(credential.user);
  }

  async function resendVerification() {
    if (!auth.currentUser) {
      throw new AuthMessageError("signInAgain");
    }
    await sendEmailVerification(auth.currentUser);
  }

  /**
   * Re-read the user after they clicked the email link. Force a new ID token:
   * the cached one can still be fresh but carry email_verified = false, and
   * the server would reject it.
   */
  async function checkVerified() {
    if (!auth.currentUser) {
      throw new AuthMessageError("signInAgain");
    }
    await auth.currentUser.reload();
    if (!auth.currentUser.emailVerified) {
      return false;
    }
    await auth.currentUser.getIdToken(true);
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
        // Signed out is the only state that shows the Google button.
        warmUpPopupSignIn();
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
    refreshSession,
    logout,
    deleteAccount,
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
