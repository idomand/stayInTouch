import React, { useState } from "react";
import { useTheme } from "styled-components";
import { useMedia } from "react-use";
import { useAuth } from "../../lib/AuthContext";
import { deleteContact, updateContact } from "../../lib/Firebase";
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
  DeleteButton,
  EmojiWrapper,
  MoreOptionsWrapper,
  NameContainer,
  NotesButtonWrapper,
  ResetButton,
  AddToGoogle,
} from "./ContactItemStyle";
import { ContactItemInterface } from "../../utils/ContactItemInterface";
import SafeCloseDialog from "../SafeCloseDialog";

export default function ContactItem({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
}: ContactItemInterface) {
  const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);

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
      <DateValue statusColor={isTalkingStatusOK}>Today!</DateValue>
    );
  } else {
    lastTalkedToResponse = (
      <DateValue statusColor={isTalkingStatusOK}>
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)} days ago
      </DateValue>
    );
  }

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  if (nextTalkInDays > 0) {
    nextTalkResponse = (
      <DateValue statusColor={isTalkingStatusOK}>
        {nextTalkInDays} days
      </DateValue>
    );
  } else {
    nextTalkResponse = (
      <DateValue statusColor={isTalkingStatusOK}>Talk Today!</DateValue>
    );
  }

  function deleteContactFunc() {
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    deleteContact(currentUser.uid, currentUser.email, contactId);
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
      {!isMobile && (
        <EmojiWrapper>{isTalkingStatusOK ? "😎" : "😡"}</EmojiWrapper>
      )}
      <ContactItemWrapper>
        {isMobile && (
          <EmojiWrapper>{isTalkingStatusOK ? "😎" : "😡"}</EmojiWrapper>
        )}
        <ContactDetailsWrapper>
          {/* <ContactImage src="/default_image.svg" /> */}
          <ContactDetailsSubDiv>
            <NameContainer>{name}</NameContainer>
          </ContactDetailsSubDiv>
        </ContactDetailsWrapper>
        <ContactDatesWrapper>
          <DateWrapper>
            <DateHeader>Talk Every</DateHeader>
            <DateValue statusColor={isTalkingStatusOK}>{time} days</DateValue>
          </DateWrapper>
          <DateWrapper>
            <DateHeader>Last Talk</DateHeader>
            <DateValue statusColor={isTalkingStatusOK}>
              {lastTalkedToResponse}
            </DateValue>
          </DateWrapper>
          <DateWrapper>
            <DateHeader>Next Talk In</DateHeader>
            {nextTalkResponse}
          </DateWrapper>
        </ContactDatesWrapper>
        <MoreOptionsWrapper>
          <MoreOptions
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </MoreOptionsWrapper>
        <NotesButtonWrapper>
          <Notes
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </NotesButtonWrapper>
        <ButtonsWrapper>
          <ResetButton onClick={resetFunction}>Reset</ResetButton>
          {/* <AddToGoogle onClick={addToGoogle}>Book</AddToGoogle> */}
          <DeleteButton
            onClick={() => {
              setShowSafeCloseDialog(true);
            }}
          >
            Delete
          </DeleteButton>
          <SafeCloseDialog
            dialogText={`Are you sure you want to delete ${name}`}
            customFunction={deleteContactFunc}
            openDialog={showSafeCloseDialog}
            closeDialog={() => setShowSafeCloseDialog(false)}
          />
        </ButtonsWrapper>
      </ContactItemWrapper>
    </ContactItemContainer>
  );
}
