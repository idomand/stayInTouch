import { useRouter } from "next/router";
import Link from "./Link";
import { P } from "./Text";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="flex items-start justify-between gap-2 px-6 py-6 bg-white w-full text-xl shadow-[0px_-1px_0px_#e5e9f2] md:grid md:grid-cols-3 md:items-center md:justify-normal md:gap-0 md:px-0">
      <div className="hidden md:block" />
      <div className="flex items-center justify-center gap-4 md:pl-6">
        <Link
          variant="Nev"
          isLinkActive={router.pathname == "/about"}
          href="/about"
        >
          About
        </Link>
        <Link
          variant="Nev"
          isLinkActive={router.pathname == "/privacy"}
          href="/privacy"
        >
          Privacy
        </Link>
      </div>
      <P extraClasses="text-grey3 whitespace-nowrap justify-self-end md:pr-6">
        © 2026 Stay-in-Touch
      </P>
    </footer>
  );
}
