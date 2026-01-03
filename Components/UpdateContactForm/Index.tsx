import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useAuth } from "../../lib/AuthContext";
import { updateContact } from "../../lib/Firebase";
import { ContactItemType } from "../../types/ContactItemType";
import { H5 } from "../Common/StyledText";
import DatePickerComponent from "../DatePickerComponent";
import ErrorWarning from "../ErrorWarning";
import {
  CloseModalButton,
  ContactNameHeader,
  EditContactForm,
  EditHeader,
  EditingSubSection,
  EditSubmitInput,
  EmailInput,
  EmailInputLabel,
  HeaderName,
  LastTalkedLabel,
  MoreOptionsWrapper,
  NameInput,
  NameLabel,
  TimeInput,
  TimeLabel,
} from "./UpdateContactFormStyle";

type UpdateContactFormState = ContactItemType & {
  isModalOpenProp: boolean;
  onClose?: () => void;
};

export default function UpdateContactForm({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
  isModalOpenProp,
  onClose,
}: UpdateContactFormState) {
  const { currentUser } = useAuth()!;
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenProp);
  const [contactName, setContactName] = useState(name);
  const [newFriendEmail, setNewFriendEmail] = useState(friendEmail);
  const [contactTime, setContactTime] = useState(time);
  const [error, setError] = useState<string | boolean>(false);
  const [lastTalk, setLastTalk] = useState<any>(timeFromLastTalk);

  useEffect(() => {
    setIsModalOpen(isModalOpenProp);
  }, [isModalOpenProp]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  async function updateContactOnSubmit(e: React.FocusEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    let timeFromLastTalkVar = lastTalk;

    if (lastTalk instanceof Date) {
      timeFromLastTalkVar = lastTalk.getTime();
    }

    const oldContactData = {
      name,
      time,
      timeFromLastTalk,
      contactId,
      notesArray,
      friendEmail,
    };
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalkVar,
      notesArray: notesArray,
      friendEmail: newFriendEmail,
    };

    let result;

    /* //* if nothing was change ==> just return */
    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time &&
      oldContactData.timeFromLastTalk == newContactData.timeFromLastTalk
    ) {
      return setIsModalOpen(false);
    } else {
      result = await updateContact(
        currentUser.uid,
        currentUser.email,
        contactId,
        oldContactData,
        newContactData,
        "edit"
      );
    }
    if (result === "bad") {
      setError("contact already in list");
      setContactName(name);
    } else {
      setIsModalOpen(false);
    }
  }

  function timeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactTime(+e.target.value);
  }

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactName(e.target.value);

    if (error) {
      setError(false);
    }
  }

  function onCloseModal() {
    setIsModalOpen(false);
    setContactName(name);
    setContactTime(time);
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  return (
    <>
      <ReactModal
        ariaHideApp={false}
        isOpen={isModalOpen}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseModal}
        className={"contact-edit-modal"}
        overlayClassName={"contact-edit-modal-overlay"}
      >
        <MoreOptionsWrapper>
          <EditingSubSection>
            <EditHeader>
              <HeaderName>
                <H5>Editing Contact:</H5>
                <ContactNameHeader>{name}</ContactNameHeader>
              </HeaderName>
              <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
            </EditHeader>
            <EditContactForm onSubmit={updateContactOnSubmit}>
              <NameLabel>
                Change Name:
                <NameInput
                  type="text"
                  placeholder="Enter Name"
                  name="name"
                  value={contactName}
                  required
                  onChange={nameChangeHandler}
                />
              </NameLabel>
              <TimeLabel>
                Change Talk Every X Days:
                <TimeInput
                  type="number"
                  name="time"
                  id="time"
                  max={60}
                  min={1}
                  value={contactTime}
                  onChange={timeChangeHandler}
                />
              </TimeLabel>
              <LastTalkedLabel>
                Change Last Time We Have Spoken
                <DatePickerComponent
                  setStartDate={setLastTalk}
                  startDate={lastTalk}
                />
              </LastTalkedLabel>

              <EmailInputLabel>
                Change Friend Email:
                <EmailInput
                  type="email"
                  value={newFriendEmail}
                  required
                  onChange={(e) => {
                    setNewFriendEmail(e.target.value);
                  }}
                />
              </EmailInputLabel>

              <EditSubmitInput
                disabled={contactName === ""}
                type="submit"
                value="Update Contact"
              />
              {error && <ErrorWarning errorMessage={error} />}
            </EditContactForm>
          </EditingSubSection>
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================
