import React, { useState } from "react";
import { useTheme } from "styled-components";
import { useMedia } from "react-use";
import { useAuth } from "../../lib/AuthContext";
import { updateContact } from "../../lib/Firebase";
import { oneDay } from "../../lib/ConstantsFile";
import MoreOptions from "../MoreOptions/Index";
import Notes from "../Notes";
import {
  ButtonsWrapper,
  ContactDatesWrapper,
  ContactDetailsSubDiv,
  ContactDetailsWrapper,
  ContactItemContainer,
  ContactItemWrapper,
  DateHeader,
  DateValue,
  DateWrapper,
  MoreOptionsWrapper,
  NameContainer,
  NotesButtonWrapper,
  ResetButton,
  AddToGoogle,
} from "./ContactItemStyle";
import { ContactItemInterface } from "../../utils/ContactItemInterface";
import SafeCloseDialog from "../SafeCloseDialog";
import { SlOptions } from "react-icons/sl";
import { IoCheckboxOutline } from "react-icons/io5";
import { BsExclamationSquare } from "react-icons/bs";

export default function ContactItem({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
}: ContactItemInterface) {
  // const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);

  const { currentUser } = useAuth()!;
  const currantTime = new Date().getTime();
  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);

  let nextTalkResponse;

  let lastTalkedToResponse;
  let isTalkingStatusOK;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    isTalkingStatusOK = true;
  } else {
    isTalkingStatusOK = false;
  }

  if (currantTime - timeFromLastTalk < 86000000) {
    lastTalkedToResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>Today!</DateValue>
    );
  } else {
    lastTalkedToResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)}
      </DateValue>
    );
  }

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  if (nextTalkInDays > 0) {
    nextTalkResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>
        Talk in {nextTalkInDays} days
      </DateValue>
    );
  } else {
    nextTalkResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>Talk Today!</DateValue>
    );
  }

  function addToGoogle() {
    console.log("addToGoogle");
  }

  function resetFunction() {
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    const oldContactData = {
      name: name,
      time: time,
      timeFromLastTalk: timeFromLastTalk,
      notesArray: notesArray,
    };
    const newContactData = {
      name: name,
      time: time,
      timeFromLastTalk: currantTime,
      notesArray: notesArray,
    };
    updateContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      oldContactData,
      newContactData,
      "reset"
    );
  }

  return (
    <ContactItemContainer>
      <ContactItemWrapper>
        <ContactDetailsWrapper>
          <ContactDetailsSubDiv>
            <NameContainer>{name}</NameContainer>
          </ContactDetailsSubDiv>
        </ContactDetailsWrapper>
        <ContactDatesWrapper>
          <DateWrapper>
            <DateValue $statusColor={isTalkingStatusOK}>
              Didn’t talk for {lastTalkedToResponse} days
            </DateValue>
          </DateWrapper>
          <DateWrapper>{nextTalkResponse}</DateWrapper>
        </ContactDatesWrapper>
        {/* <MoreOptionsWrapper>
          <MoreOptions
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </MoreOptionsWrapper> */}
        <NotesButtonWrapper>
          <Notes
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
          {isMobile && (
            <MoreOptions
              name={name}
              time={time}
              timeFromLastTalk={timeFromLastTalk}
              contactId={contactId}
              notesArray={notesArray}
            />
          )}
        </NotesButtonWrapper>
        <ButtonsWrapper>
          {isTalkingStatusOK ? (
            <IoCheckboxOutline
              onClick={resetFunction}
              color={Theme.green1}
              size={50}
            />
          ) : (
            <BsExclamationSquare
              onClick={resetFunction}
              color={Theme.red1}
              size={50}
            />
          )}
          {!isMobile && (
            <MoreOptions
              name={name}
              time={time}
              timeFromLastTalk={timeFromLastTalk}
              contactId={contactId}
              notesArray={notesArray}
            />
          )}

          {/* <AddToGoogle onClick={addToGoogle}>Book</AddToGoogle> */}
        </ButtonsWrapper>
      </ContactItemWrapper>
    </ContactItemContainer>
  );
}
