"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { H1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth()!;
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Handles an already-signed-in user landing on /login. During a fresh sign-in
  // isSigningIn is true, so this does not fire before the cookie is set — that
  // navigation is done explicitly in handleSignIn after loginWithGoogle awaits it.
  useEffect(() => {
    if (currentUser && !isSigningIn) {
      router.replace("/");
    }
  }, [currentUser, isSigningIn, router]);

  async function handleSignIn() {
    setIsSigningIn(true);
    try {
      // loginWithGoogle awaits the session cookie, so "/" passes the middleware.
      await loginWithGoogle();
      router.replace("/");
      router.refresh();
    } catch {
      // Failed or cancelled popup: re-enable the button.
      setIsSigningIn(false);
    }
  }

  return (
    <section className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-black/5">
        <div className="flex flex-col items-center gap-2">
          <H1>Welcome back</H1>
          <P2 extraClasses="text-grey3">
            Sign in to manage your reminders and stay in touch with the people
            you care about.
          </P2>
        </div>
        <Button
          extraClasses="w-full gap-3 bg-white text-black border border-grey1 py-2.5 px-4 text-base font-semibold hover:bg-grey1 hover:text-black"
          buttonText={isSigningIn ? "Signing in…" : "Sign in with Google"}
          onClick={handleSignIn}
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
      </div>
    </section>
  );
}
