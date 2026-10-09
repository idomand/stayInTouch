"use client";

import NextLink from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../lib/AuthContext";
import { usePendingRequestCount } from "@/lib/PendingRequestCountContext";
import { getMyPendingRequestCount } from "@/lib/actions/links";
import Link from "./ui/Link";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  const { currentUser } = useAuth()!;
  const pathname = usePathname();
  const t = useTranslations();
  const { count: pendingCount, setCount: setPendingCount } =
    usePendingRequestCount();

  // Fetch on sign-in only. Accept and reject on /settings push the new count
  // through PendingRequestCountSync, and sign-out resets it here (uid → none).
  // Refetching on every route change cost a session check and a query each time.
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
  }, [currentUser?.uid, setPendingCount]);

  return (
    // Equal side columns keep the links centred whether or not Log Out shows.
    <nav className="sticky top-0 z-2 grid h-15 w-full grid-cols-[1fr_auto_1fr] items-center bg-white shadow-[0px_1px_0px_#e5e9f2]">
      <NextLink
        href="/"
        aria-label={t("navBar.homeLabel")}
        className="justify-self-start"
      >
        <img
          src="/friendsLogo.png"
          className="my-1 ml-5 h-10 sm:hidden"
          alt={t("navBar.logoAlt")}
        />
        <span className="hover:text-blue1 m-0 ml-10 hidden p-0 text-2xl font-semibold transition-colors duration-300 sm:block">
          Stay-in-Touch
        </span>
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
              <span className="bg-blue1 ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      ) : (
        <Link variant="Nav" isLinkActive={pathname === "/login"} href="/login">
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
