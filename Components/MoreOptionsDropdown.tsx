"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SlOptions } from "react-icons/sl";
import { deleteContact } from "@/lib/actions/contacts";
import { unlinkContact } from "@/lib/actions/links";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import AppointmentForm from "./AppointmentForm";
import UpdateContactForm from "./UpdateContactForm";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import LinkContactDialog from "./LinkContactDialog";
import ErrorWarning from "./ErrorWarning";
import { P2 } from "./ui/Text";
import NextLink from "next/link";

export default function MoreOptionsDropdown({
  contact,
}: {
  contact: ContactListItem;
}) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateContactModalOpen, setIsUpdateContactModalOpen] =
    useState(false);
  const [isAppointmentFormModalOpen, setIsAppointmentFormModalOpen] =
    useState(false);
  const [isDeleteContactModalOpen, setIsDeleteContactModalOpen] =
    useState(false);
  const [isLinkContactDialogOpen, setIsLinkContactDialogOpen] =
    useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | false>(false);
  const [deleteError, setDeleteError] = useState<string | false>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleUpdateContact = () => {
    setIsUpdateContactModalOpen(true);
    setIsOpen(false);
  };

  const handleMakeAppointment = () => {
    setIsAppointmentFormModalOpen(true);
    setIsOpen(false);
  };

  const handleDeleteContact = () => {
    setIsDeleteContactModalOpen(true);
    setIsOpen(false);
  };

  const handleLinkContact = () => {
    setIsLinkContactDialogOpen(true);
    setIsOpen(false);
  };

  const handleUnlinkContact = () => {
    setIsUnlinkConfirmOpen(true);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function deleteContactFunc() {
    const result = await deleteContact(contact.id);
    if (!result.ok) {
      setDeleteError(result.error);
    }
  }

  async function unlinkContactFunc() {
    const result = await unlinkContact(contact.id);
    if (!result.ok) {
      setUnlinkError(result.error);
    } else {
      setIsUnlinkConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="bg-transparent px-5 py-2.5 text-base outline-0 border-0 cursor-pointer hover:bg-transparent focus:bg-transparent"
        >
          <SlOptions />
        </button>
        <div
          className={`absolute top-full right-0 mt-2 bg-white min-w-50 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] rounded-lg z-[1000] overflow-hidden ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div
            onClick={handleUpdateContact}
            className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
          >
            {t("moreOptionsDropdown.updateContact")}
          </div>
          <div
            onClick={handleMakeAppointment}
            className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
          >
            {t("moreOptionsDropdown.makeAppointment")}
          </div>
          {!contact.isLinked && !contact.hasPendingRequest ? (
            <div
              onClick={handleLinkContact}
              className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
            >
              {t("moreOptionsDropdown.linkWithFriend")}
            </div>
          ) : contact.hasPendingRequest ? (
            <NextLink href="/settings">
              <div className="px-4 py-3 text-grey3 text-sm not-last:border-b not-last:border-grey2">
                <P2 extraClasses="text-grey3">{t("moreOptionsDropdown.linkPending")}</P2>
              </div>
            </NextLink>
          ) : contact.isLinked ? (
            <div
              onClick={handleUnlinkContact}
              className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
            >
              {t("common.unlink")}
            </div>
          ) : null}
          <div
            onClick={handleDeleteContact}
            className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
          >
            {t("moreOptionsDropdown.deleteContact")}
          </div>
        </div>
      </div>
      <UpdateContactForm
        contact={contact}
        isModalOpenProp={isUpdateContactModalOpen}
        onClose={() => setIsUpdateContactModalOpen(false)}
      />
      <AppointmentForm
        contact={contact}
        isModalOpenProp={isAppointmentFormModalOpen}
        onClose={() => setIsAppointmentFormModalOpen(false)}
      />
      <Dialog
        title={t("common.areYouSure")}
        isOpen={isDeleteContactModalOpen}
        close={() => {
          setIsDeleteContactModalOpen(false);
          setDeleteError(false);
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between flex-wrap gap-2">
            <Button
              buttonText={t("moreOptionsDropdown.deleteName", { name: contact.name })}
              onClick={deleteContactFunc}
            />
            <Button
              buttonText={t("moreOptionsDropdown.goBack")}
              onClick={() => {
                setIsDeleteContactModalOpen(false);
                setDeleteError(false);
              }}
            />
          </div>
          {deleteError && <ErrorWarning errorMessage={deleteError} />}
        </div>
      </Dialog>
      <LinkContactDialog
        contact={contact}
        isOpen={isLinkContactDialogOpen}
        close={() => setIsLinkContactDialogOpen(false)}
      />
      <Dialog
        title={t("moreOptionsDropdown.unlinkTitle")}
        isOpen={isUnlinkConfirmOpen}
        close={() => {
          setIsUnlinkConfirmOpen(false);
          setUnlinkError(false);
        }}
      >
        <div className="flex flex-col gap-4">
          <P2 extraClasses="text-grey3">
            {t("moreOptionsDropdown.unlinkText")}
          </P2>
          <div className="flex justify-between gap-2">
            <Button
              buttonText={t("common.unlink")}
              onClick={unlinkContactFunc}
              variant="Secondary"
            />
            <Button
              buttonText={t("common.cancel")}
              onClick={() => {
                setIsUnlinkConfirmOpen(false);
                setUnlinkError(false);
              }}
            />
          </div>
          {unlinkError && <ErrorWarning errorMessage={unlinkError} />}
        </div>
      </Dialog>
    </>
  );
}
