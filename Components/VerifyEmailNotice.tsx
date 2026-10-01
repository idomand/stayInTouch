"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authErrorMessage, useAuth } from "@/lib/AuthContext";
import { H1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";

/**
 * Shown on /login while a user is signed in on the client but has not
 * verified their email. They have no session cookie until they verify.
 */
export default function VerifyEmailNotice() {
  const { currentUser, checkVerified, resendVerification, logout } = useAuth()!;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(null);
    setInfo(null);
    setIsBusy(true);
    try {
      await action();
    } catch (caughtError) {
      setError(authErrorMessage(caughtError));
    } finally {
      setIsBusy(false);
    }
  }

  function handleCheckVerified() {
    return run(async () => {
      if (await checkVerified()) {
        // reload() updates the user in place without a re-render, so navigate
        // here rather than waiting for the page's redirect effect.
        router.replace("/");
        router.refresh();
      } else {
        setInfo("Not verified yet. Click the link in the email, then try again.");
      }
    });
  }

  function handleResend() {
    return run(async () => {
      await resendVerification();
      setInfo("We sent a new verification email. Not there? Check your spam folder.");
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <H1>Check your inbox</H1>
      <P2 extraClasses="text-grey3">
        We sent a verification link to <strong>{currentUser?.email}</strong>.
        Click it, then come back here. Not there? Check your spam folder.
      </P2>

      {error && <P2 extraClasses="text-red1">{error}</P2>}
      {info && <P2 extraClasses="text-green2">{info}</P2>}

      <Button
        buttonText="I've verified"
        onClick={handleCheckVerified}
        disabled={isBusy}
        extraClasses="w-full py-2.5 text-base font-semibold"
      />
      <Button
        buttonText="Resend email"
        onClick={handleResend}
        disabled={isBusy}
        variant="Secondary"
        extraClasses="w-full"
      />
      <Button
        buttonText="Use another account"
        onClick={logout}
        disabled={isBusy}
        variant="Secondary"
        extraClasses="w-full"
      />
    </div>
  );
}
