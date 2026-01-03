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
  // const Theme = useTheme();
  // const isMobile = useMedia(`(${Theme.devices.break1})`);
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenProp);
  const [contactName, setContactName] = useState(name);
  const [newFriendEmail, setNewFriendEmail] = useState(friendEmail);
  const [contactTime, setContactTime] = useState(time);
  const [error, setError] = useState<string | boolean>(false);
  const [lastTalk, setLastTalk] = useState<any>(timeFromLastTalk);
  // const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);
  // const currantTime = new Date().getTime();

  // let nextTalkInDays =
  //   time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  // Calculate the specific reminder date based on nextTalkInDays
  // const calculateReminderDate = () => {
  //   if (nextTalkInDays <= 0) {
  //     return new Date(); // If overdue, use today
  //   }
  //   const reminderDate = new Date();
  //   reminderDate.setDate(reminderDate.getDate() + nextTalkInDays);
  //   return reminderDate;
  // };

  // const [specificReminder, setSpecificReminder] = useState<number | Date>(
  //   calculateReminderDate()
  // );

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

  // function onOpenModal(e: React.MouseEvent<HTMLElement>) {
  //   setIsModalOpen(true);
  //   e.currentTarget.blur();
  // }

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

  // function calenderFunction() {
  //   // Open Google Calendar dialog directly
  //   const eventDate =
  //     specificReminder instanceof Date
  //       ? specificReminder
  //       : new Date(specificReminder);

  //   createGoogleCalendarEvent(name, eventDate, friendEmail);
  // }

  // function deleteContactFunc() {
  //   if (currentUser == null || currentUser.email == null || contactId == null)
  //     return;

  //   deleteContact(currentUser.uid, currentUser.email, contactId);
  // }
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
              {/* <DeleteButton
                type="button"
                onClick={() => {
                  setShowSafeCloseDialog(true);
                }}
              >
                Delete
              </DeleteButton> */}
            </EditContactForm>
            {/* <SafeCloseDialog
              dialogText={`Are you sure you want to delete ${name}`}
              customFunction={deleteContactFunc}
              openDialog={showSafeCloseDialog}
              closeDialog={() => setShowSafeCloseDialog(false)}
            /> */}
          </EditingSubSection>

          {/* <CalendarSubSection>
            <CalendarHeader>
              <H5>Calendar Options</H5>

            </CalendarHeader>

            <SpecificTimeWrapper>
              <CalenderText>
                Add this reminder into Google Calender
              </CalenderText>
              <CalenderDatePickerWrapper>
                <DatePickerComponent
                  setStartDate={setSpecificReminder}
                  startDate={specificReminder}
                />
              </CalenderDatePickerWrapper>
            </SpecificTimeWrapper>
            <SaveToGoogleCalender onClick={calenderFunction}>
              <CalenderLogo src="/Google_Calendar.svg" alt="Google Calendar" />
              Save to Calender
            </SaveToGoogleCalender>
          </CalendarSubSection> */}
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================
