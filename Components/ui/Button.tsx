import type { ReactNode } from "react";

type Props = {
  buttonText: string;
  onClick: () => void;
  extraClasses?: string;
  children?: ReactNode;
};

export default function Button({
  buttonText,
  onClick,
  extraClasses = "",
  children,
}: Props) {
  const basicClasses =
    "cursor-pointer text-sm bg-blue1 text-white py-1 px-2 rounded-md hover:bg-blue3 border-current hover:text-blue1 ease-in duration-300 border font-medium flex  items-center transition active:bg-blue3";

  return (
    <button className={`${basicClasses} ${extraClasses}`} onClick={onClick}>
      {children}
      {buttonText}
    </button>
  );
}
