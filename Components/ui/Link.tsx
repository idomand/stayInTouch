import NextLink from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  href: any;
  children?: React.ReactNode;
  extraClasses?: string;
  variant?: "Primary" | "Nev" | "Text";
  isLinkActive?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
};

export default function Link({
  href,
  children,
  extraClasses,
  variant = "Primary",
  isLinkActive = false,
  target = "_self",
}: Props) {
  const baseClasses = "hover:text-blue1 hover:border-b-2 font-bold";
  const primaryClasses = "";
  const navClasses = "text-sm";
  const textClasses = "border-b text-blue1 ml-1";

  const isActiveClasses = isLinkActive ? "border-b-2" : "";

  const variantClasses = {
    Primary: primaryClasses,
    Nev: navClasses,
    Text: textClasses,
  }[variant];

  return (
    <NextLink
      target={target}
      href={href}
      className={twMerge(
        baseClasses,
        variantClasses,
        isActiveClasses,
        extraClasses,
      )}
    >
      {children}
    </NextLink>
  );
}
