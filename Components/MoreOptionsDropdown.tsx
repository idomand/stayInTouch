"use client";
import { useEffect, useId, useRef, useState } from "react";
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

const menuItemClasses =
  "block w-full text-left px-4 py-3 cursor-pointer bg-transparent border-0 text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2";

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
  const [isLinkContactDialogOpen, setIsLinkContactDialogOpen] = useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | false>(false);
  const [deleteError, setDeleteError] = useState<string | false>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  function closeAndFocusTrigger() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleMenuKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      closeAndFocusTrigger();
    }
  }

  // Tabbing out of the menu closes it, like a click outside.
  function handleMenuBlur(event: React.FocusEvent) {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  }

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
      <div
        className="relative inline-block"
        ref={dropdownRef}
        onKeyDown={handleMenuKeyDown}
        onBlur={handleMenuBlur}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          aria-label={t("moreOptionsDropdown.moreOptions", {
            name: contact.name,
          })}
          aria-expanded={isOpen}
          aria-controls={menuId}
          className="bg-transparent px-5 py-2.5 text-base border-0 rounded-md cursor-pointer hover:bg-transparent focus:bg-transparent"
        >
          <SlOptions aria-hidden="true" />
        </button>
        <div
          id={menuId}
          className={`absolute top-full right-0 mt-2 bg-white min-w-50 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] rounded-lg z-1000 overflow-hidden ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <button
            type="button"
            onClick={handleUpdateContact}
            className={menuItemClasses}
          >
            {t("moreOptionsDropdown.updateContact")}
          </button>
          <button
            type="button"
            onClick={handleMakeAppointment}
            className={menuItemClasses}
          >
            {t("moreOptionsDropdown.makeAppointment")}
          </button>
          {!contact.isLinked && !contact.hasPendingRequest ? (
            <button
              type="button"
              onClick={handleLinkContact}
              className={menuItemClasses}
            >
              {t("moreOptionsDropdown.linkWithFriend")}
            </button>
          ) : contact.hasPendingRequest ? (
            <NextLink href="/settings" className={menuItemClasses}>
              {t("moreOptionsDropdown.linkPending")}
            </NextLink>
          ) : contact.isLinked ? (
            <button
              type="button"
              onClick={handleUnlinkContact}
              className={menuItemClasses}
            >
              {t("common.unlink")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDeleteContact}
            className={menuItemClasses}
          >
            {t("moreOptionsDropdown.deleteContact")}
          </button>
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
        title={t("moreOptionsDropdown.deleteTitle", { name: contact.name })}
        isOpen={isDeleteContactModalOpen}
        close={() => {
          setIsDeleteContactModalOpen(false);
          setDeleteError(false);
        }}
      >
        <div className="flex flex-col gap-4">
          <P2 extraClasses="text-grey3">
            {t("moreOptionsDropdown.deleteText")}
          </P2>
          <div className="flex justify-between flex-wrap gap-2">
            <Button
              buttonText={t("moreOptionsDropdown.deleteName", {
                name: contact.name,
              })}
              onClick={deleteContactFunc}
              variant="Danger"
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
