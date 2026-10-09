"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { authErrorMessage, useAuth } from "@/lib/AuthContext";
import { P2 } from "@/Components/ui/Text";
import ErrorWarning from "@/Components/ErrorWarning";
import PasswordInput from "@/Components/ui/PasswordInput";
import {
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";

type Mode = "signIn" | "signUp" | "reset";

type Props = {
  /**
   * Signs in and navigates. Owned by the login page so the email and Google
   * flows share one "signing in" flag — otherwise the page's redirect effect
   * would fire before the session cookie is set.
   */
  onSignIn: (email: string, password: string) => Promise<void>;
  /**
   * Prefills the email field, e.g. from an invite link.
   */
  initialEmail?: string;
  disabled?: boolean;
};

const inputClasses = twMerge(
  basicInputClasses,
  "cursor-text px-3 border border-solid border-grey2",
);
const linkButtonClasses =
  "cursor-pointer bg-transparent border-none p-0 text-sm text-blue1 hover:underline";

export default function EmailAuthForm({ onSignIn, initialEmail, disabled = false }: Props) {
  const { signUpWithEmail, sendPasswordReset } = useAuth()!;
  const t = useTranslations();
  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signUp" && password !== confirmPassword) {
      setError(t("emailAuthForm.passwordsDoNotMatch"));
      return;
    }

    setIsBusy(true);
    try {
      if (mode === "signIn") {
        await onSignIn(email, password);
      } else if (mode === "signUp") {
        // On success the login page swaps this form for the verify screen.
        await signUpWithEmail(name.trim(), email, password);
      } else {
        await sendPasswordReset(email);
        // Firebase does not reveal whether the email exists, so neither do we.
        setInfo(t("emailAuthForm.resetSent"));
      }
    } catch (caughtError) {
      setError(authErrorMessage(caughtError, t));
    } finally {
      setIsBusy(false);
    }
  }

  const isDisabled = disabled || isBusy;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2 text-left">
      {mode === "signUp" && (
        <label className={basicLabelClasses}>
          {t("emailAuthForm.name")}
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            className={inputClasses}
          />
        </label>
      )}

      <label className={basicLabelClasses}>
        {t("emailAuthForm.email")}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className={inputClasses}
        />
      </label>

      {mode !== "reset" && (
        <label className={basicLabelClasses}>
          {t("emailAuthForm.password")}
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            minLength={6}
            required
            className={inputClasses}
          />
        </label>
      )}

      {mode === "signUp" && (
        <label className={basicLabelClasses}>
          {t("emailAuthForm.confirmPassword")}
          <PasswordInput
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className={inputClasses}
          />
        </label>
      )}

      {error && <ErrorWarning errorMessage={error} extraClasses="mx-1" />}
      {info && <P2 extraClasses="text-green2 mx-1">{info}</P2>}

      <button
        type="submit"
        disabled={isDisabled}
        className={twMerge(
          inputSubmitClasses,
          "h-10 mx-1 mt-1 bg-blue1 font-semibold text-base hover:bg-blue3 hover:border-blue1 hover:text-blue1",
        )}
      >
        {isBusy ? t("emailAuthForm.pleaseWait") : t(`emailAuthForm.${mode}`)}
      </button>

      <div className="flex justify-between mx-1 mt-1">
        {mode === "signIn" ? (
          <>
            <button type="button" onClick={() => switchMode("signUp")} className={linkButtonClasses}>
              {t("emailAuthForm.createAccount")}
            </button>
            <button type="button" onClick={() => switchMode("reset")} className={linkButtonClasses}>
              {t("emailAuthForm.forgotPassword")}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => switchMode("signIn")} className={linkButtonClasses}>
            {t("emailAuthForm.backToSignIn")}
          </button>
        )}
      </div>
    </form>
  );
}
