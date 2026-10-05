"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

/**
 * A password input field with a show/hide toggle button.
 */
export default function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={twMerge(className, "pr-14 w-full")}
      />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue1"
        aria-label={isVisible ? t("passwordInput.hidePassword") : t("passwordInput.showPassword")}
        aria-pressed={isVisible}
      >
        {isVisible ? t("passwordInput.hide") : t("passwordInput.show")}
      </button>
    </div>
  );
}
