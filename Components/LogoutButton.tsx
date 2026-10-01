"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";

export default function LogoutButton() {
  const { logout } = useAuth()!;
  const t = useTranslations("LogoutButton");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  function onLogout() {
    setIsLogoutModalOpen(false);
    logout();
  }

  return (
    <>
      <Dialog
        isOpen={isLogoutModalOpen}
        title={t("confirmTitle")}
        close={() => {
          setIsLogoutModalOpen(false);
        }}
      >
        <Button buttonText={t("logOut")} onClick={onLogout} />
      </Dialog>
      <button
        onClick={() => {
          setIsLogoutModalOpen(true);
        }}
        className="cursor-pointer flex items-center transition-all duration-300 bg-transparent border-none text-xs font-medium text-blue1 rounded-[10px] px-1 py-0.5 hover:text-black hover:bg-blue3"
      >
        {t("logOutButton")}
        <img src="/log-out.svg" alt="" className="ml-1" />
      </button>
    </>
  );
}
