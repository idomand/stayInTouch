import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  buttonText: string;
  onClick: () => void;
  extraClasses?: string;
  children?: ReactNode;
  variant?: "Primary" | "Secondary" | "Ghost" | "Danger";
  disabled?: boolean;
  /**
   * Defaults to "button". The browser default is "submit", which made any
   * Button inside a form submit it. Submitting must be asked for.
   */
  type?: "button" | "submit";
  ariaLabel?: string;
};

export default function Button({
  buttonText,
  onClick,
  extraClasses = "",
  children,
  variant = "Primary",
  disabled = false,
  type = "button",
  ariaLabel,
}: Props) {
  const baseClasses =
    "justify-center cursor-pointer flex items-center transition ease-in duration-200 text-sm rounded-md border-current font-medium";

  const primaryClasses =
    "bg-blue1 text-white py-1 px-2 hover:bg-blue3 border hover:text-blue1";

  const secondaryButtonClasses = "border-b-3 rounded-none  p-1 ";

  const ghostButtonClass =
    " px-1 bg-transparent text-2xl text-black border-none  hover:bg-grey1 ";

  const dangerClasses =
    "bg-red1 text-white py-1 px-2 border border-red1 hover:bg-white hover:text-red1";

  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  const variantClasses = {
    Primary: primaryClasses,
    Secondary: secondaryButtonClasses,
    Ghost: ghostButtonClass,
    Danger: dangerClasses,
  }[variant];

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={twMerge(
        baseClasses,
        variantClasses,
        disabled && disabledClasses,
        extraClasses
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {buttonText}
    </button>
  );
}
