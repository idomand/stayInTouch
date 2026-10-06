"use client";

import NextLink from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import { getMyPendingRequestCount } from "@/lib/actions/links";
import Link from "./ui/Link";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  const { currentUser } = useAuth()!;
  const pathname = usePathname();
  const t = useTranslations();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.uid) {
      setPendingCount(0);
      return;
    }

    let isMounted = true;

    async function loadPendingCount() {
      try {
        const count = await getMyPendingRequestCount();
        if (isMounted) {
          setPendingCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch pending request count:", error);
      }
    }

    loadPendingCount();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid, pathname]);

  return (
    // Equal side columns keep the links centred whether or not Log Out shows.
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center bg-white sticky z-2 top-0 w-full h-15 shadow-[0px_1px_0px_#e5e9f2]">
      <NextLink
        href="/"
        aria-label={t("navBar.homeLabel")}
        className="justify-self-start"
      >
        <img
          src="/friendsLogo.png"
          className="ml-5 my-1 h-10 sm:hidden"
          alt={t("navBar.logoAlt")}
        />
        <h2 className="ml-10 hidden sm:block text-2xl font-semibold m-0 p-0 transition-colors duration-300 hover:text-blue1">
          Stay-in-Touch
        </h2>
      </NextLink>

      {currentUser ? (
        <div className="flex items-center gap-4">
          <Link variant="Nav" isLinkActive={pathname === "/"} href="/">
            {t("navBar.home")}
          </Link>
          <Link
            variant="Nav"
            isLinkActive={pathname === "/settings"}
            href="/settings"
            extraClasses="flex items-center"
          >
            {t("navBar.settings")}
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center bg-blue1 text-white rounded-full h-4 w-4 text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      ) : (
        <Link
          variant="Nav"
          isLinkActive={pathname === "/login"}
          href="/login"
        >
          {t("navBar.loginPage")}
        </Link>
      )}

      <div className="justify-self-end">
        {currentUser && pathname === "/settings" && (
          <div className="mr-5">
            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  );
}
