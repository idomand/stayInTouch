import { useEffect, useRef, useState } from "react";
import { SlOptions } from "react-icons/sl";
import { useAuth } from "../lib/AuthContext";
import { deleteContact } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import AppointmentForm from "./AppointmentForm";
import UpdateContactForm from "./UpdateContactForm";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";

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
  const [isDeleteContactModelOpen, setIsDeleteContactModelOpen] =
    useState(false);

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
    setIsDeleteContactModelOpen(true);
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
            Update Contact
          </div>
          <div
            onClick={handleMakeAppointment}
            className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
          >
            Make Appointment
          </div>
          <div
            onClick={handleDeleteContact}
            className="px-4 py-3 cursor-pointer text-black text-sm transition-colors duration-200 hover:bg-grey2 active:bg-grey3 not-last:border-b not-last:border-grey2"
          >
            Delete Contact
          </div>
        </div>
      </div>
      <UpdateContactForm
        friendEmail={friendEmail}
        name={name}
        time={time}
        timeFromLastTalk={timeFromLastTalk}
        contactId={contactId}
        notesArray={notesArray}
        isModalOpenProp={isUpdateContactModalOpen}
        onClose={() => setIsUpdateContactModalOpen(false)}
      />
      <AppointmentForm
        friendEmail={friendEmail}
        name={name}
        time={time}
        timeFromLastTalk={timeFromLastTalk}
        isModalOpenProp={isAppointmentFormModalOpen}
        onClose={() => setIsAppointmentFormModalOpen(false)}
      />
      <Dialog
        title={`Are you sure?`}
        isOpen={isDeleteContactModelOpen}
        close={() => {
          setIsDeleteContactModelOpen(false);
        }}
      >
        <div className="flex justify-between">
          <Button buttonText={`Delete ${name}`} onClick={deleteContactFunc} />
          <Button
            buttonText={`Go back`}
            onClick={() => {
              setIsDeleteContactModelOpen(false);
            }}
          />
        </div>
      </Dialog>
    </>
  );
}
