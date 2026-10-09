"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { authErrorMessage, useAuth } from "@/lib/AuthContext";
import { H1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";
import ErrorWarning from "@/Components/ErrorWarning";

/**
 * Shown on /login while a user is signed in on the client but has not
 * verified their email. They have no session cookie until they verify.
 */
export default function VerifyEmailNotice() {
  const { currentUser, checkVerified, resendVerification, logout } = useAuth()!;
  const router = useRouter();
  const t = useTranslations();
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
      setError(authErrorMessage(caughtError, t));
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
        setInfo(t("verifyEmailNotice.notVerifiedYet"));
      }
    });
  }

  function handleResend() {
    return run(async () => {
      await resendVerification();
      setInfo(t("verifyEmailNotice.resent"));
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <H1>{t("verifyEmailNotice.title")}</H1>
      <P2 extraClasses="text-grey3">
        {t.rich("verifyEmailNotice.sentTo", {
          email: currentUser?.email ?? "",
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </P2>

      {error && <ErrorWarning errorMessage={error} />}
      {info && <P2 extraClasses="text-green2">{info}</P2>}

      <Button
        buttonText={t("verifyEmailNotice.verified")}
        onClick={handleCheckVerified}
        disabled={isBusy}
        extraClasses="w-full py-2.5 text-base font-semibold"
      />
      <Button
        buttonText={t("verifyEmailNotice.resend")}
        onClick={handleResend}
        disabled={isBusy}
        variant="Secondary"
        extraClasses="w-full"
      />
      <Button
        buttonText={t("verifyEmailNotice.useAnotherAccount")}
        onClick={logout}
        disabled={isBusy}
        variant="Secondary"
        extraClasses="w-full"
      />
    </div>
  );
}
