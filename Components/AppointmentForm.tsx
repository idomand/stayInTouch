import { useEffect, useState } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import { createGoogleCalendarEvent } from "../lib/CalenderFunctions";
import { oneDay } from "../lib/ConstantsFile";
import { ContactItemType } from "../types/ContactItemType";
import { H5, P1 } from "./Common/StyledText";
import { BasicForm } from "./Common/StyledFormElements";
import DatePickerComponent from "./DatePickerComponent";
import Button from "./ui/Button";

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
    calculateReminderDate(),
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
              <Button onClick={onCloseModal} buttonText="X" variant="Ghost" />
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
            <Button
              buttonText="Save to Calender"
              onClick={calenderFunction}
              extraClasses="mt-2 hover:bg-green3 hover:text-blue1"
            >
              <img
                src="/Google_Calendar.svg"
                alt="Google Calendar"
                className="mr-2"
              />
            </Button>
          </CalendarSubSection>
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================

const CalendarSubSection = styled.div`
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 0;
  }
`;

const CalenderDatePickerWrapper = styled.div`
  @media (${({ theme }) => theme.devices.break1}) {
    margin: auto;
  }
`;
const CalenderText = styled(P1)`
  margin-bottom: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-left: 15px;
    text-align: start;
  }
`;

const ContactNameHeader = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;
const EditHeader = styled.div`
  margin-left: 30px;
  margin-top: 25px;
  display: flex;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-content: space-between;
    /* margin-top: 10px; */
    margin: 10px 15px;
  }
`;

const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;

const SpecificTimeWrapper = styled(BasicForm)`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
    align-items: flex-start;
    margin-top: 0;
  }
`;
