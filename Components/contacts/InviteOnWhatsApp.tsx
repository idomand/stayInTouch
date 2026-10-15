"use client";
import { useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa";
import {
  basicFormClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";

export default function InviteOnWhatsApp() {
  const t = useTranslations();

  function inviteOnWhatsApp() {
    // Built in the handler, not at render: window does not exist during SSR.
    const message = t("addNewContact.whatsAppMessage", {
      url: window.location.origin,
    });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      className={twMerge(
        basicFormClasses,
        "mx-auto mt-3 flex w-[85vw] max-w-full flex-col px-1 py-2.5 sm:m-auto sm:mt-3 sm:p-3.5",
      )}
    >
      <button
        type="button"
        onClick={inviteOnWhatsApp}
        className={twMerge(
          inputSubmitClasses,
          "text-green1 border-green1 hover:bg-green3 focus:bg-green3 mx-1 my-0 flex h-10 items-center justify-center gap-2 bg-white",
        )}
      >
        <FaWhatsapp size={18} aria-hidden="true" />
        {t("addNewContact.inviteWhatsApp")}
      </button>
    </div>
  );
}
