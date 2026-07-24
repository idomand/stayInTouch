import { useEffect, useState } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import { createGoogleCalendarEvent } from "../lib/CalenderFunctions";
import { oneDay } from "../lib/ConstantsFile";
import { ContactItemType } from "../types/ContactItemType";
import { H5, P1 } from "./Common/StyledText";
import { BasicButton } from "./Common/StyledButton";
import { BasicForm } from "./Common/StyledFormElements";
import DatePickerComponent from "./DatePickerComponent";

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

const CalenderLogo = styled.img`
  justify-self: flex-start;
`;
const CalenderText = styled(P1)`
  margin-bottom: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-left: 15px;
    text-align: start;
  }
`;
const CloseModalButton = styled(BasicButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.black};
  border: none;
  font-size: ${({ theme }) => theme.typeScale.header3};
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue3};
    border: none;
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
    /* margin: auto; */
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

const SaveToGoogleCalender = styled(BasicButton)`
  width: 100%;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.blue3};
  border: 1.3px solid ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.blue1};
  margin-top: 23px;
  &:hover,
  &:focus {
    border: 1.3px solid ${({ theme }) => theme.green1};
    color: ${({ theme }) => theme.green1};
    background: ${({ theme }) => theme.green3};
  }

  @media (${({ theme }) => theme.devices.break1}) {
    margin: 10px 0;
    max-width: fit-content;
    width: auto;
    align-self: center;
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
