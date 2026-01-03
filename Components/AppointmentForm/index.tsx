import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { createGoogleCalendarEvent } from "../../lib/CalenderFunctions";
import { oneDay } from "../../lib/ConstantsFile";
import { ContactItemType } from "../../types/ContactItemType";
import { H5 } from "../Common/StyledText";
import DatePickerComponent from "../DatePickerComponent";
import {
  CalendarSubSection,
  CalenderDatePickerWrapper,
  CalenderLogo,
  CalenderText,
  CloseModalButton,
  ContactNameHeader,
  EditHeader,
  MoreOptionsWrapper,
  SaveToGoogleCalender,
  SpecificTimeWrapper,
} from "./AppointmentFormStyle";

type AppointmentFormState = Omit<
  ContactItemType,
  "contactId" | "notesArray"
> & {
  isModalOpenProp: boolean;
  onClose?: () => void;
};

export default function AppointmentForm({
  name,
  time,
  timeFromLastTalk,
  friendEmail,
  isModalOpenProp,
  onClose,
}: AppointmentFormState) {
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenProp);
  const [error, setError] = useState<string | boolean>(false);
  const currantTime = new Date().getTime();

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  // Calculate the specific reminder date based on nextTalkInDays
  const calculateReminderDate = () => {
    if (nextTalkInDays <= 0) {
      return new Date(); // If overdue, use today
    }
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + nextTalkInDays);
    return reminderDate;
  };

  const [specificReminder, setSpecificReminder] = useState<number | Date>(
    calculateReminderDate()
  );

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

  function onCloseModal() {
    setIsModalOpen(false);
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  function calenderFunction() {
    // Open Google Calendar dialog directly
    const eventDate =
      specificReminder instanceof Date
        ? specificReminder
        : new Date(specificReminder);

    createGoogleCalendarEvent(name, eventDate, friendEmail);
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
          <CalendarSubSection>
            <EditHeader>
              <div>
                <H5>Make Appointment with</H5>
                <ContactNameHeader>{name}</ContactNameHeader>
              </div>
              <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
            </EditHeader>
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
          </CalendarSubSection>
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================
