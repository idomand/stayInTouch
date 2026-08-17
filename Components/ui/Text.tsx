import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: ReactNode;
  extraClasses?: string;
};

export function H1({ children, extraClasses = "" }: Props) {
  return <h1 className={twMerge("m-0 p-0 text-[2rem] font-bold", extraClasses)}>{children}</h1>;
}

export function H2({ children, extraClasses = "" }: Props) {
  return <h2 className={twMerge("m-0 p-0 text-2xl font-semibold", extraClasses)}>{children}</h2>;
}

export function H3({ children, extraClasses = "" }: Props) {
  return <h3 className={twMerge("m-0 p-0 text-[1.375rem] font-medium", extraClasses)}>{children}</h3>;
}

export function H4({ children, extraClasses = "" }: Props) {
  return <h4 className={twMerge("m-0 p-0 text-xl font-medium", extraClasses)}>{children}</h4>;
}

export function H5({ children, extraClasses = "" }: Props) {
  return <h5 className={twMerge("m-0 p-0 text-lg font-normal", extraClasses)}>{children}</h5>;
}

export function P({ children, extraClasses = "" }: Props) {
  return <p className={twMerge("m-0 p-0 text-sm font-normal", extraClasses)}>{children}</p>;
}
