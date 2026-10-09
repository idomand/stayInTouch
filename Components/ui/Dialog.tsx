import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { H2 } from "./Text";

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
  const t = useTranslations();
  const ref = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  const dialogClasses = twMerge(
    "fixed inset-0 m-auto w-[90vw] max-w-xl rounded-lg p-6 shadow-lg backdrop:bg-black/40 max-h-[90vh] overflow-y-auto",
    extraClasses,
  );

  return (
    <dialog
      ref={ref}
      onCancel={close}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      aria-labelledby={titleId}
      className={dialogClasses}
    >
      {/* Content mounts only while open: a page of contacts would otherwise
          mount every hidden form and date picker up front. */}
      {isOpen && (
        <>
          <div className="mb-4 flex items-start justify-between">
            <H2 id={titleId}>{title}</H2>
            <button
              type="button"
              onClick={close}
              aria-label={t("common.close")}
              className="cursor-pointer px-1 bg-transparent text-2xl text-black border-none rounded-md hover:bg-grey1"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div>{children}</div>
        </>
      )}
    </dialog>
  );
}
