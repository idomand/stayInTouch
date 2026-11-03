import NextLink, { type LinkProps } from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  href: LinkProps["href"];
  children?: React.ReactNode;
  extraClasses?: string;
  /** "Button" looks like a button: no hover underline, which would change its height. */
  variant?: "Primary" | "Nav" | "Text" | "Button";
  isLinkActive?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  prefetch?: LinkProps["prefetch"];
};

export default function Link({
  href,
  children,
  extraClasses,
  variant = "Primary",
  isLinkActive = false,
  target = "_self",
  prefetch,
}: Props) {
  const baseClasses =
    variant === "Button" ? "" : "hover:text-blue1 hover:border-b-2 font-bold";
  const primaryClasses = "";
  const navClasses = "text-sm border-b-2 border-blue1/40 hover:border-blue1";
  const textClasses = "border-b text-blue1 ml-1";
  const buttonClasses =
    "inline-flex items-center justify-center rounded-md border font-semibold transition duration-200 ease-in";

  const isActiveClasses = isLinkActive
    ? "border-b-2 border-blue1 text-blue1"
    : "";

  const variantClasses = {
    Primary: primaryClasses,
    Nav: navClasses,
    Text: textClasses,
    Button: buttonClasses,
  }[variant];

  return (
    <NextLink
      target={target}
      href={href}
      prefetch={prefetch}
      aria-current={isLinkActive ? "page" : undefined}
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
