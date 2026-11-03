"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BsInfoCircleFill } from "react-icons/bs";
import ContactList from "@/Components/contacts/ContactList";
import MainForm from "@/Components/contacts/MainForm";
import Link from "@/Components/ui/Link";
import Spinner from "@/Components/ui/Spinner";
import { ContactActionsProvider } from "@/lib/contacts/ContactActionsContext";
import {
  createDemoActions,
  type DemoContact,
  loadDemoContacts,
  saveDemoContacts,
  toListItems,
} from "@/lib/demo/demoStore";

/** Says plainly that `/demo` is not the real app, with the way in. */
function DemoBanner() {
  const t = useTranslations();

  return (
    <aside className="bg-blue1 mx-auto mt-3 mb-4 flex w-[85vw] max-w-195 flex-col items-center gap-3 rounded-[15px] px-5 py-4 text-center text-white shadow-lg sm:flex-row sm:text-left">
      <BsInfoCircleFill size={32} aria-hidden="true" className="shrink-0" />
      <div className="flex min-w-0 grow flex-col gap-1">
        <p className="m-0 flex flex-wrap items-center justify-center gap-2 text-lg font-bold sm:justify-start">
          <span className="text-blue1 rounded-full bg-white px-2.5 py-0.5 text-xs tracking-wider uppercase">
            {t("demo.badge")}
          </span>
          {t("demo.bannerTitle")}
        </p>
        <p className="m-0 text-sm">{t("demo.bannerText")}</p>
      </div>
      <Link
        href="/login"
        variant="Button"
        extraClasses="text-blue1 hover:bg-blue3 shrink-0 border-white bg-white px-4 py-2 text-sm hover:text-white"
      >
        {t("demo.bannerCta")}
      </Link>
    </aside>
  );
}

/**
 * The home page on demo data. The real components run unchanged; the
 * provider swaps their Server Actions for the localStorage store.
 */
export default function Demo() {
  const t = useTranslations();
  // null until loaded: localStorage exists only in the browser, so the server
  // and the first client render both show the spinner.
  const [contacts, setContacts] = useState<DemoContact[] | null>(null);
  // Actions read the ref, so two changes in a row both see the latest list.
  const contactsRef = useRef<DemoContact[]>([]);

  useEffect(() => {
    const loaded = loadDemoContacts({
      mom: t("demo.seedMom"),
      bestFriend: t("demo.seedBestFriend"),
    });
    contactsRef.current = loaded;
    setContacts(loaded);
    // Load once; a language change must not reseed or reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const demoActions = useMemo(
    () =>
      createDemoActions({
        translateError: ({ key, values }) => t(`errors.${key}`, values),
        getContacts: () => contactsRef.current,
        setContacts: (next) => {
          contactsRef.current = next;
          saveDemoContacts(next);
          setContacts(next);
        },
      }),
    [t],
  );

  return (
    <>
      <DemoBanner />
      {contacts === null ? (
        <Spinner className="mx-auto mt-10 block" />
      ) : (
        <ContactActionsProvider value={demoActions}>
          <MainForm />
          <ContactList contacts={toListItems(contacts)} />
        </ContactActionsProvider>
      )}
    </>
  );
}
