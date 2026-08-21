import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { H2 } from "./Text";
import Button from "./Button";

type DialogProps = {
  title: string;
  isOpen: boolean;
  close: () => void;
  children: ReactNode;
  extraClasses?: string;
};

export default function Dialog({
  title,
  isOpen,
  close,
  children,
  extraClasses = "",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = ref.current;
    const handleClick = (e: Event) => {
      if (dialog && e.target === dialog) {
        close();
      }
    };
    dialog?.addEventListener("click", handleClick);
    return () => dialog?.removeEventListener("click", handleClick);
  }, [close]);

  const dialogClasses = twMerge(
    "fixed inset-0 m-auto w-[90vw] max-w-xl  rounded-lg p-6 shadow-lg backdrop:bg-black/40",
    extraClasses,
  );

  return (
    <dialog ref={ref} onCancel={close} className={dialogClasses}>
      <div className="mb-4 flex items-start justify-between">
        <H2>{title}</H2>
        <Button onClick={close} buttonText="X" variant="Ghost" />
      </div>
      <div>{children}</div>
    </dialog>
  );
}
