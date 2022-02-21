import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import ReactModal from "react-modal";
import propTypes from "prop-types";
import DatePickerComponent from "./DatePickerComponent";
import { updateContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import {
  BasicForm,
  BasicInput,
  BasicLabel,
  InputSubmit,
} from "./Common/StyledFormElements";
import ErrorWarning from "./ErrorWarning";
import { BasicButton, MinimalButton } from "./Common/StyledButton";
import { H5, P1 } from "./Common/StyledText";
import { useMedia } from "react-use";

const MoreOptionsButton = styled(MinimalButton)``;

const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
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

const EditingSubSection = styled.div``;

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

const HeaderName = styled.div`
  display: flex;
`;

const ContactNameHeader = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;

const EditContactForm = styled(BasicForm)`
  display: grid;
  border-radius: 0;
  padding: 15px;
  margin: 10px;
  gap: 30px;
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  grid-template-areas:
    "name howMuchTime"
    "lastTalked lastTalked"
    "submit submit";

  @media (${({ theme }) => theme.devices.break1}) {
    border-right: none;
    gap: 5px;
    padding: 10px;
    margin: 0;

    grid-template-areas:
      "name name"
      "howMuchTime howMuchTime"
      "lastTalked lastTalked"
      "submit submit";
  }
`;

const NameLabel = styled(BasicLabel)`
  grid-area: name;
`;
const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
`;

const TimeLabel = styled(BasicLabel)`
  grid-area: howMuchTime;
  position: relative;
  &::after {
    content: "Days" attr(data-domain);
    font-weight: bold;
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: ${({ theme }) => theme.grey3};
  }
`;

const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
`;

const LastTalkedLabel = styled.div`
  grid-area: lastTalked;
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
`;
const EditSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  width: 415px;
  height: 45px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;

const CalendarSubSection = styled.div`
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 0;
  }
`;

const CalendarHeader = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (${({ theme }) => theme.devices.break1}) {
    margin: 10px 15px;
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
const CalenderText = styled(P1)`
  margin-bottom: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-left: 15px;
    text-align: start;
  }
`;

const CalenderDatePickerWrapper = styled.div`
  @media (${({ theme }) => theme.devices.break1}) {
    margin: auto;
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

const CalenderLogo = styled.img`
  justify-self: flex-start;
`;

export default function MoreOptions({
  name,
  time,
  timeFromLastTalk,
  contactId,
}) {
  const { currentUser } = useAuth();
  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);
  const [lastTalk, setLastTalk] = useState(timeFromLastTalk);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);
  const [specificReminder, setSpecificReminder] = useState(timeFromLastTalk);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  async function updateContactOnSubmit(e) {
    e.preventDefault();

    let timeFromLastTalkVar = lastTalk;

    if (typeof lastTalk !== "number") {
      timeFromLastTalkVar = lastTalk.getTime();
    }

    const oldContactData = {
      name,
      time,
      timeFromLastTalk,
      contactId,
    };
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalkVar,
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
        newContactData
      );
    }
    if (result === "bad") {
      setError("contact already in list");
      setContactName(name);
    } else {
      setIsModalOpen(false);
    }
  }

  function timeChangeHandler(e) {
    setContactTime(e.target.value);
  }

  function nameChangeHandler(e) {
    setContactName(e.target.value);

    if (error) {
      setError(false);
    }
  }
  function onOpenModal(e) {
    setIsModalOpen(true);
    e.currentTarget.blur();
  }

  function onCloseModal() {
    setIsModalOpen(false);
    setContactName(name);
    setContactTime(time);
    if (error) {
      setError(false);
    }
  }

  function calenderFunction() {
    setError("coming soon");
  }

  return (
    <>
      <MoreOptionsButton onClick={onOpenModal}>More Options</MoreOptionsButton>
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
              {isMobile && (
                <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
              )}
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
                  max={31}
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

              <EditSubmitInput
                disabled={contactName === ""}
                type="submit"
                value="Update Contact"
              />
              {error && <ErrorWarning errorMessage={error} />}
            </EditContactForm>
          </EditingSubSection>
          <CalendarSubSection>
            <CalendarHeader>
              <H5>Calendar Options</H5>

              {!isMobile && (
                <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
              )}
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
          </CalendarSubSection>
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

MoreOptions.propTypes = {
  name: propTypes.string,
  time: propTypes.number,
  timeFromLastTalk: propTypes.number,
  contactId: propTypes.string,
};

//?========================
//* The styles of the Modal are in the global.css file
//?========================
