import React, { useState, useRef } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import propTypes from "prop-types";
import DatePickerComponent from "./DatePickerComponent";
import { updateContactFull, updateContactTime } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import {
  BasicForm,
  BasicInput,
  BasicLabel,
  InputSubmit,
} from "./Common/StyledFormElements";
import ErrorWarning from "./ErrorWarning";
import { BasicButton } from "./Common/StyledButton";
import { H5, P3 } from "./Common/StyledText";

const EditButton = styled.button`
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  border: none;
  background-color: transparent;
  padding: 0;
  border-bottom: solid;
  margin-bottom: 5px;
  transition: 0.3s all;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.blue2};
  }
`;

const HeaderText = styled(H5)``;

const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
const CloseModalButton = styled(BasicButton)`
  &:hover,
  &:focus {
  }
`;

const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UpdateContactForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;
//?================================================================================================
//?================================================================================================
const MoreOptionsWrapper = styled.section`
  border: solid red;
  display: flex;
  justify-content: center;
`;

const EditingSubSection = styled.div``;

const EditHeader = styled.div`
  margin-left: 30px;
  margin-top: 25px;
  display: flex;
  grid-area: header;
`;

const ContactNameHeader = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  margin-left: 5px;
`;

const EditContactForm = styled(BasicForm)`
  display: grid;
  border-radius: 0;
  padding: 15px;
  margin: 10px;
  gap: 5px;
  border-right: 1px grey solid;
  grid-template-areas:
    "name howMuchTime"
    "lastTalked tag"
    "submit submit";
`;

const NameLabel = styled(BasicLabel)``;
const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
`;

const TimeLabel = styled(BasicLabel)`
grid-area: howMuchTime;
  position: relative;
  &::after {
    content: "Days" attr(data-domain);
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: ${({ theme }) => theme.grey3}
    font-weight: bold;
  }
`;

const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
`;
const TagLabel = styled(BasicLabel)`
  grid-area: tag;
`;
const TagInput = styled.select`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
  height: 30px;

  background-color: ${({ theme }) => theme.grey1};
`;
const TagOption = styled.option`
  background-color: goldenrod;
  border: blue solid;
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
`;

const CalendarSubSection = styled.div``;

const CalendarHeader = styled.div`
  margin-top: 25px;
`;

const SpecificTimeWrapper = styled(BasicForm)``;

const SpecificTimeInput = styled(BasicInput)`
  background-color: ${({ theme }) => theme.blue1};
  transition: all 0.3s;
  color: ${({ theme }) => theme.white};
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

const SaveToGoogleCalender = styled(BasicButton)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CalenderLogo = styled.img`
  justify-self: flex-start;
`;

//?================================================================================================
//?================================================================================================

export default function MoreOptions({
  name,
  time,
  timeFromLastTalk,
  contactId,
  tag,
}) {
  const { currentUser } = useAuth();

  const timeRef = useRef();
  const [startDate, setStartDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);
  const [tagValue, setTagValue] = useState(tag);
  const [specificReminder, setSpecificReminder] = useState(new Date());
  const [error, setError] = useState(false);

  async function updateContactOnSubmit(e) {
    e.preventDefault();
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalk,
    };
    const oldContactData = { name, time, timeFromLastTalk };

    let result;

    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time
    ) {
      return setIsModalOpen(false);
    } else if (oldContactData.name == newContactData.name) {
      result = await updateContactTime(
        currentUser.uid,
        currentUser.email,
        contactId,
        newContactData
      );
    } else {
      result = await updateContactFull(
        currentUser.uid,
        currentUser.email,
        contactId,
        newContactData
      );
    }

    if (result === "bad") {
      setError("contact already in list");
    } else {
      setIsModalOpen(false);
    }
  }

  function nameChangeHandler(e) {
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
  }

  return (
    <>
      <EditButton onClick={() => setIsModalOpen(true)}>More Options</EditButton>
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
              <H5>Editing Contact:</H5>
              <ContactNameHeader>{name}</ContactNameHeader>
            </EditHeader>

            <EditContactForm>
              <NameLabel>
                Change Name:
                <NameInput
                  type="text"
                  placeholder="Enter Name"
                  name="name"
                  value={name}
                  required
                  onChange={nameChangeHandler}
                />
              </NameLabel>
              <TimeLabel>
                Talk Every X Days:
                <TimeInput
                  ref={timeRef}
                  type="number"
                  name="time"
                  id="time"
                  max={31}
                  min={1}
                  defaultValue={3}
                />
              </TimeLabel>
              <LastTalkedLabel>
                Last Time We Have Spoken
                <DatePickerComponent
                  setStartDate={setStartDate}
                  startDate={startDate}
                />
              </LastTalkedLabel>

              <TagLabel>
                Change Tag:
                <TagInput
                  onChange={(e) => {
                    setTagValue(e.target.value);
                  }}
                >
                  <TagOption>select</TagOption>
                  <TagOption>Coworker</TagOption>
                  <TagOption>Friend</TagOption>
                  <TagOption>Family</TagOption>
                  <TagOption>Other</TagOption>
                </TagInput>
              </TagLabel>
              <EditSubmitInput
                disabled={contactName === ""}
                type="submit"
                value="Update Contact"
              />
            </EditContactForm>
          </EditingSubSection>
          <CalendarSubSection>
            <CalendarHeader>
              <H5>Calendar Options</H5>
            </CalendarHeader>

            <SpecificTimeWrapper>
              Add a specific Date Reminder
              <DatePickerComponent
                setStartDate={setSpecificReminder}
                startDate={specificReminder}
              />
              {/* <SpecificTimeInput type="submit" value="save specific Date" /> */}
            </SpecificTimeWrapper>
            <SaveToGoogleCalender>
              <CalenderLogo src="/Google_Calendar.svg" alt="Google Calendar" />
              Save to Calender
            </SaveToGoogleCalender>
          </CalendarSubSection>
        </MoreOptionsWrapper>

        {/* <ModalHeaderWrapper>
            <HeaderText>Update Contact: {name}</HeaderText>
            <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
          </ModalHeaderWrapper>

          <ModalInputWrapper>
            <UpdateContactForm onSubmit={updateContactOnSubmit}>
              <InputWrapper>
                <BasicLabel htmlFor="name">Name:</BasicLabel>
                <BasicInput
                  id="name"
                  type="text"
                  value={contactName}
                  onChange={nameChangeHandler}
                />
              </InputWrapper>
              <InputWrapper>
                <BasicLabel htmlFor="time">Talk every X days?</BasicLabel>
                <BasicInput
                  id="time"
                  type="number"
                  max={31}
                  min={1}
                  value={contactTime}
                  onChange={(e) => setContactTime(e.target.value)}
                />
              </InputWrapper>
              <EditSubmitInput
                disabled={contactName === ""}
                type="submit"
                value="Update Contact"
              />
            </UpdateContactForm>
            {error && <ErrorWarning errorMessage={error} />}
          </ModalInputWrapper> */}
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
//?========================
//* The styles of the Modal are in the global.css file
//?========================
