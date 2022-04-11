import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import DatePickerComponent from "../DatePickerComponent";
import { useAuth } from "../../lib/AuthContext";
import { useMedia } from "react-use";
import { useTheme } from "styled-components";
import { updateContact } from "../../lib/Firebase";

import {
  CalendarHeader,
  CalendarSubSection,
  CalenderDatePickerWrapper,
  CalenderLogo,
  CalenderText,
  MoreOptionsButton,
  MoreOptionsWrapper,
  SaveToGoogleCalender,
  SpecificTimeWrapper,
  ContactNameHeader,
  EditContactForm,
  EditHeader,
  EditingSubSection,
  EditSubmitInput,
  HeaderName,
  LastTalkedLabel,
  NameInput,
  NameLabel,
  TimeInput,
  TimeLabel,
  CloseModalButton,
} from "./MoreOptionsStyle";
import { H5 } from "../Common/StyledText";
import ErrorWarning from "../ErrorWarning";

interface moreOptionsProps {
  name: string;
  time: number;
  timeFromLastTalk: number;
  contactId: string;
}

export default function MoreOptions({
  name,
  time,
  timeFromLastTalk,
  contactId,
}: moreOptionsProps) {
  const { currentUser } = useAuth();
  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastTalk, setLastTalk] = useState<number | Date>(timeFromLastTalk);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);
  const [specificReminder, setSpecificReminder] = useState<number | Date>(
    timeFromLastTalk
  );
  const [error, setError] = useState<string | boolean>(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  async function updateContactOnSubmit(e: React.FocusEvent<HTMLFormElement>) {
    e.preventDefault();
    let timeFromLastTalkVar = lastTalk;

    if (lastTalk instanceof Date) {
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

  function timeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactTime(+e.target.value);
  }

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactName(e.target.value);

    if (error) {
      setError(false);
    }
  }

  function onOpenModal(e: React.MouseEvent<HTMLElement>) {
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

//?========================
//* The styles of the Modal are in the global.css file
//?========================
