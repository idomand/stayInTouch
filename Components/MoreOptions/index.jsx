import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import propTypes from "prop-types";
import DatePickerComponent from "../DatePickerComponent";
import { updateContact } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import ErrorWarning from "../ErrorWarning";
import { useMedia } from "react-use";
import { useTheme } from "styled-components";
import {
  CalendarHeader,
  CalendarSubSection,
  CalenderDatePickerWrapper,
  CalenderLogo,
  CalenderText,
  CloseModalButton,
  ContactNameHeader,
  EditContactForm,
  EditHeader,
  EditingSubSection,
  EditSubmitInput,
  HeaderName,
  LastTalkedLabel,
  MoreOptionsButton,
  MoreOptionsWrapper,
  NameInput,
  NameLabel,
  SaveToGoogleCalender,
  SpecificTimeWrapper,
  TimeInput,
  TimeLabel,
} from "./MoreOptionsStyle";
import { H5 } from "../Common/StyledText";

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
