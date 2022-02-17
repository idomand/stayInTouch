import React, { useState, useRef } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import propTypes from "prop-types";
import DatePickerComponent from "./DatePickerComponent";
import {
  updateContactFull,
  updateContactTime,
  updateContact,
} from "../lib/Firebase";
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
import TagSelect from "./TagSelect";

const MoreOptionsButton = styled(MinimalButton)``;

const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
`;

const CloseModalButton = styled(BasicButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.black};
  border: none;
  font-size: larger;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue3};
    border: none;
  }
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
const TagLabel = styled(BasicLabel)`
  grid-area: tag;
`;
/* const TagInput = styled.select`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
  height: 30px;

  background-color: ${({ theme }) => theme.grey1};
`;
const TagOption = styled.option`
  background-color: goldenrod;
  border: blue solid;
`;
 */
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

const CalendarSubSection = styled.div`
  margin-right: 20px;
  display: flex;
  flex-direction: column;
`;

const CalendarHeader = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CalenderText = styled(P1)`
  margin-bottom: 10px;
`;

const SpecificTimeWrapper = styled(BasicForm)`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// const SpecificTimeInput = styled(BasicInput)`
//   background-color: ${({ theme }) => theme.blue1};
//   transition: all 0.3s;
//   color: ${({ theme }) => theme.white};
//   &:hover,
//   &:focus {
//     background: ${({ theme }) => theme.blue3};
//     border: 1.3px solid ${({ theme }) => theme.blue1};
//     color: ${({ theme }) => theme.blue1};
//   }
// `;

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

  // const timeRef = useRef();
  const [startDate, setStartDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);
  const [tagValue, setTagValue] = useState(tag);
  const [specificReminder, setSpecificReminder] = useState(new Date());
  const [error, setError] = useState(false);

  async function updateContactOnSubmit(e) {
    e.preventDefault();

    const oldContactData = {
      name,
      time,
      timeFromLastTalk,
      contactId,
      tag,
    };

    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalk,
    };

    let result;

    /* //* if nothing was change ==> just return */

    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time
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
              <H5>Editing Contact:</H5>
              <ContactNameHeader>{name}</ContactNameHeader>
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
                Talk Every X Days:
                <TimeInput
                  // ref={timeRef}
                  type="number"
                  name="time"
                  id="time"
                  max={31}
                  min={1}
                  value={contactTime}
                  onChange={timeChangeHandler}
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
                <TagSelect tagValue={tagValue} setTagValue={setTagValue} />
              </TagLabel>
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
              <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
            </CalendarHeader>

            <SpecificTimeWrapper>
              <CalenderText>
                Add this reminder into Google Calender
              </CalenderText>
              <DatePickerComponent
                setStartDate={setSpecificReminder}
                startDate={specificReminder}
              />
            </SpecificTimeWrapper>
            <SaveToGoogleCalender>
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
//?========================
//* The styles of the Modal are in the global.css file
//?========================
