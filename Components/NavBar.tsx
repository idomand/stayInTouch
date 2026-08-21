import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import Link from "./ui/Link";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";

export default function NavBar() {
  const { currentUser, logout } = useAuth()!;
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);

  const router = useRouter();

  return (
    <nav className="flex justify-between items-center bg-white sticky z-[2] top-0 w-full h-15 shadow-[0px_1px_0px_#e5e9f2]">
      <img
        src="/friendsLogo.png"
        className="ml-5 my-1 h-10 sm:hidden"
        alt="Stay-in-Touch logo"
      />
      <h2 className="ml-10 hidden sm:block text-2xl font-semibold m-0 p-0">
        Stay-in-Touch!
      </h2>
      <div className="text-xl">
        {currentUser && (
          <Link variant="Nev" isLinkActive={router.pathname == "/"} href="/">
            Home
          </Link>
        )}
        <Link
          variant="Nev"
          isLinkActive={router.pathname == "/about"}
          href="/about"
          extraClasses="mx-2"
        >
          About
        </Link>
      </div>

      {currentUser ? (
        <>
          <Dialog
            isOpen={isLogoutModelOpen}
            title="are you sure?"
            close={() => {
              setIsLogoutModelOpen(false);
            }}
          >
            <Button buttonText="Log out" onClick={logout} />
          </Dialog>
          <button
            onClick={() => {
              setIsLogoutModelOpen(true);
            }}
            className="cursor-pointer flex items-center transition-all duration-300 bg-transparent border-none text-xs font-medium text-blue1 m-2.5 rounded-[10px] px-1 py-0.5 hover:text-black hover:bg-blue3"
          >
            Log Out
            <img src="/log-out.svg" alt="log out" className="ml-1" />
          </button>
        </>
      ) : (
        <a
          href="/login"
          className="text-xs font-medium bg-blue1 text-white px-4 py-2 rounded-md border-[1.3px] border-white transition-all duration-300 m-2.5 inline-block hover:bg-blue3 hover:border-blue1 hover:text-blue1"
        >
          Login page
        </a>
      )}
    </nav>
  );
}
