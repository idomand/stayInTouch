import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: ReactNode;
  extraClasses?: string;
  id?: string;
};

/** The white bordered card used on the settings, about and privacy pages. */
export default function Card({ children, extraClasses = "", id }: Props) {
  return (
    <section
      id={id}
      className={twMerge(
        "w-full rounded-[10px] border border-black/10 bg-white p-4 sm:p-6",
        extraClasses,
      )}
    >
      {children}
    </section>
  );
}
