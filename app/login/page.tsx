"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { authErrorMessage, useAuth } from "@/lib/AuthContext";
import { H1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";
import EmailAuthForm from "@/Components/EmailAuthForm";
import VerifyEmailNotice from "@/Components/VerifyEmailNotice";

function Login() {
  const {
    loginWithGoogle,
    signInWithEmail,
    currentUser,
    hasSession,
    refreshSession,
  } = useAuth()!;
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const invitedEmail = searchParams.get("email")?.trim() || undefined;

  // Handles an already-signed-in user landing on /login. Gate on hasSession,
  // not currentUser: the proxy checks the cookie, and a client-signed-in
  // user without one (unverified, expired cookie, cookie still being minted)
  // would be bounced straight back here in a loop. During a fresh sign-in
  // signInAndGo navigates itself.
  // hasSession can be stale: the server sends a user here when it rejects
  // their cookie (revoked by a logout on another device, or expired). So
  // re-check with refreshSession first instead of trusting the flag.
  useEffect(() => {
    if (!hasSession || isSigningIn) {
      return;
    }
    let isCancelled = false;
    refreshSession().then((isValid) => {
      if (isValid && !isCancelled) {
        router.replace("/");
      }
    });
    return () => {
      isCancelled = true;
    };
    // refreshSession is a new function every render; listing it would re-run
    // this effect, and re-mint the cookie, on every render.
  }, [hasSession, isSigningIn, router]);

  /** Shared by Google and email sign-in: sign in, wait for the cookie, go home. */
  async function signInAndGo(signIn: () => Promise<void>) {
    setIsSigningIn(true);
    try {
      await signIn();
      window.location.replace("/");
      router.refresh();
    } catch (error) {
      setIsSigningIn(false);
      throw error;
    }
  }

  async function handleGoogleSignIn() {
    setGoogleError(null);
    try {
      await signInAndGo(loginWithGoogle);
    } catch (error) {
      // null when the user closed the popup — nothing to show.
      setGoogleError(authErrorMessage(error, t));
    }
  }

  const isUnverified = Boolean(currentUser && !currentUser.emailVerified);

  return (
    <section className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-black/5">
        {isUnverified ? (
          <VerifyEmailNotice />
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <H1>{t("login.welcome")}</H1>
              <P2 extraClasses="text-grey3">{t("login.intro")}</P2>
            </div>
            {invitedEmail && (
              <P2 extraClasses="text-grey3">
                {t.rich("login.invitedEmailNote", {
                  email: invitedEmail,
                  strong: (chunks) => (
                    <strong className="text-black">{chunks}</strong>
                  ),
                })}
              </P2>
            )}
            <Button
              extraClasses="w-full gap-3 bg-white text-black border border-grey1 py-2.5 px-4 text-base font-semibold hover:bg-grey1 hover:text-black"
              buttonText={
                isSigningIn ? t("login.signingIn") : t("login.signInWithGoogle")
              }
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <svg
                  className="h-5 w-5 animate-spin-slow"
                  viewBox="0 0 50 50"
                  aria-hidden="true"
                >
                  <circle
                    className="animate-dash stroke-blue1 [stroke-linecap:round]"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                  />
                </svg>
              ) : (
                <img src="/Google-logo.png" alt="" className="h-5 w-5" />
              )}
            </Button>
            {googleError && <P2 extraClasses="text-red1">{googleError}</P2>}

            <div className="flex items-center w-full gap-3 text-grey3 text-sm">
              <span className="h-px flex-1 bg-grey1" />
              {t("login.or")}
              <span className="h-px flex-1 bg-grey1" />
            </div>

            <EmailAuthForm
              onSignIn={(email, password) =>
                signInAndGo(() => signInWithEmail(email, password))
              }
              initialEmail={invitedEmail}
              disabled={isSigningIn}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
