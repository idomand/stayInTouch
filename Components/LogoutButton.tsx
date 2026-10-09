"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";

export default function LogoutButton() {
  const { logout } = useAuth()!;
  const t = useTranslations();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  function onLogout() {
    setIsLogoutModalOpen(false);
    logout();
  }

  return (
    <>
      <Dialog
        isOpen={isLogoutModalOpen}
        title={t("logoutButton.confirmTitle")}
        close={() => {
          setIsLogoutModalOpen(false);
        }}
      >
        <Button buttonText={t("logoutButton.logOut")} onClick={onLogout} />
      </Dialog>
      <button
        onClick={() => {
          setIsLogoutModalOpen(true);
        }}
        className="text-blue1 hover:bg-blue3 flex cursor-pointer items-center rounded-[10px] border-none bg-transparent px-1 py-0.5 text-xs font-medium transition-all duration-300 hover:text-black"
      >
        {t("logoutButton.logOutButton")}
        <Image
          src="/log-out.svg"
          alt=""
          width={24}
          height={24}
          className="ml-1"
        />
      </button>
    </>
  );
}
