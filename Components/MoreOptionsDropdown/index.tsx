import { useEffect, useRef, useState } from "react";
import { SlOptions } from "react-icons/sl";
import { useAuth } from "../../lib/AuthContext";
import { deleteContact } from "../../lib/Firebase";
import { ContactItemType } from "../../types/ContactItemType";
import AppointmentForm from "../AppointmentForm";
import SafeCloseDialog from "../SafeCloseDialog";
import MoreOptions from "../UpdateContactForm/Index";
import {
  DropdownButton,
  DropdownContainer,
  DropdownItem,
  DropdownMenu,
} from "./MoreOptionsDropdownStyles";

export default function MoreOptionsDropdown({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
}: ContactItemType) {
  const { currentUser } = useAuth()!;
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateContactModalOpen, setIsUpdateContactModalOpen] =
    useState(false);
  const [isAppointmentFormModalOpen, setIsAppointmentFormModalOpen] =
    useState(false);
  const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleUpdateContact = () => {
    console.log("update contact");
    setIsUpdateContactModalOpen(true);
    setIsOpen(false);
  };

  const handleMakeAppointment = () => {
    setIsAppointmentFormModalOpen(true);
    setIsOpen(false);
  };

  const handleDeleteContact = () => {
    setShowSafeCloseDialog(true);
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

  function deleteContactFunc() {
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    deleteContact(currentUser.uid, currentUser.email, contactId);
  }

  return (
    <>
      <DropdownContainer ref={dropdownRef}>
        <DropdownButton onClick={toggleDropdown}>
          <SlOptions />
        </DropdownButton>
        <DropdownMenu $isOpen={isOpen}>
          <DropdownItem onClick={handleUpdateContact}>
            Update Contact
          </DropdownItem>
          <DropdownItem onClick={handleMakeAppointment}>
            Make Appointment
          </DropdownItem>
          <DropdownItem onClick={handleDeleteContact}>
            Delete Contact
          </DropdownItem>
        </DropdownMenu>
      </DropdownContainer>
      <MoreOptions
        friendEmail={friendEmail}
        name={name}
        time={time}
        timeFromLastTalk={timeFromLastTalk}
        contactId={contactId}
        notesArray={notesArray}
        isModalOpenProp={isUpdateContactModalOpen}
        onClose={() => setIsUpdateContactModalOpen(false)}
      />
      {/* contactId={contactId}
        notesArray={notesArray} */}
      <AppointmentForm
        friendEmail={friendEmail}
        name={name}
        time={time}
        timeFromLastTalk={timeFromLastTalk}
        isModalOpenProp={isAppointmentFormModalOpen}
        onClose={() => setIsAppointmentFormModalOpen(false)}
      />
      <SafeCloseDialog
        dialogText={`Are you sure you want to delete ${name}`}
        customFunction={deleteContactFunc}
        openDialog={showSafeCloseDialog}
        closeDialog={() => setShowSafeCloseDialog(false)}
      />
    </>
  );
}
