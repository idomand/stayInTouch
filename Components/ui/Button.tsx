import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  buttonText: string;
  onClick: () => void;
  extraClasses?: string;
  children?: ReactNode;
  variant?: "Primary" | "Secondary" | "Ghost";
};

export default function Button({
  buttonText,
  onClick,
  extraClasses = "",
  children,
  variant = "Primary",
}: Props) {
  const baseClasses =
    "justify-center cursor-pointer flex items-center transition ease-in duration-300 text-sm rounded-md border-current font-medium";

  const basicClasses = "bg-blue1 text-white py-1 px-2 hover:bg-blue3 border";

  const secondaryButtonClasses = "border-b-3 rounded-none  p-1 ";

  const ghostButtonClass =
    " px-1 bg-transparent text-2xl text-black border-none  hover:bg-grey1 ";

  const variantClasses = {
    Primary: basicClasses,
    Secondary: secondaryButtonClasses,
    Ghost: ghostButtonClass,
  }[variant];

  return (
    <button
      className={twMerge(baseClasses, variantClasses, extraClasses)}
      onClick={onClick}
    >
      {children}
      {buttonText}
    </button>
  );
}
