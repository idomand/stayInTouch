import React from "react";
import { useAuth } from "../lib/AuthContext";
import { useMedia } from "react-use";

import propTypes from "prop-types";
import {
  deleteContact,
  // resetTimerForContact,
  updateContact,
} from "../lib/Firebase";
import { oneDay } from "../lib/ConstantsFile";
import styled, { useTheme } from "styled-components";
import { BasicButton } from "./Common/StyledButton";
import MoreOptions from "./MoreOptions";
import Notes from "./Notes";

const ContactItemContainer = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 75vw;
  list-style-type: none;
  margin: 10px 5px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 85vw;
  }
`;
const ContactItemWrapper = styled.div`
  display: grid;
  flex-grow: 1;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.white};
  border-radius: 15px;
  padding: 10px;
  grid-template-areas:
    "contactDetails contactDates moreOptions moreOptions"
    "contactDetails contactDates notes buttons";

  @media (${({ theme }) => theme.devices.break1}) {
    grid-template-areas:
      "emojiStatus contactDetails contactDetails notes "
      ". contactDetails contactDetails . "
      "contactDates contactDates contactDates contactDates "
      ". buttons buttons ."
      " . moreOptions moreOptions .";
  }
`;

const NotesButtonWrapper = styled.div`
  grid-area: notes;
`;

const EmojiWrapper = styled.div`
  margin-right: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    grid-area: emojiStatus;
    margin-right: 0;
    text-align: end;
  }
`;

const ContactDetailsWrapper = styled.div`
  grid-area: contactDetails;
  display: flex;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
    align-items: center;
  }
`;
const ContactDetailsSubDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const NameContainer = styled.span`
  margin-bottom: 10px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.header5};
  line-height: 21px;
  text-transform: capitalize;
  overflow: auto;
  width: 100px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 160px;
    overflow: scroll;

    text-align: center;
    margin-bottom: 0px;
  }
`;
const TagContainer = styled.span`
  color: ${({ theme }) => theme.blue2};
  font-weight: 400;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  line-height: 21px;

  @media (${({ theme }) => theme.devices.break1}) {
    text-align: center;
  }
`;

const ContactImage = styled.img`
  margin-right: 15px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin: 0;
  }
`;

const ContactDatesWrapper = styled.div`
  grid-area: contactDates;
  display: flex;

  @media (${({ theme }) => theme.devices.break1}) {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 15px;
    margin-top: 15px;
    margin-bottom: 20px;
  }
`;
const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 15px;
`;
const DateHeader = styled.div`
  color: ${({ theme }) => theme.grey3};
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  margin-bottom: 6px;
`;
const DateValue = styled.div`
  color: ${({ theme, statusColor }) => {
    if (!statusColor) {
      return theme.red1;
    } else {
      return theme.grey3;
    }
  }};

  font-weight: 600;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  line-height: 20px;
  text-align: center;
  margin: 0;
`;

const MoreOptionsWrapper = styled.div`
  grid-area: moreOptions;
  display: flex;
  justify-content: flex-end;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-content: center;
    margin-top: 15px;
  }
`;

const ButtonsWrapper = styled.div`
  grid-area: buttons;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResetButton = styled(BasicButton)`
  margin: 0 10px;
`;

const DeleteButton = styled(BasicButton)`
  color: ${({ theme }) => theme.red1};
  background-color: ${({ theme }) => theme.red2};
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.red2};
    background-color: ${({ theme }) => theme.red1};
    border: ${({ theme }) => theme.red2} 1.3px solid;
  }
`;

export default function ContactItem({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  tag,
}) {
  const { currentUser } = useAuth();
  const currantTime = new Date().getTime();

  const Theme = useTheme();
  const isMobile = useMedia(`(${Theme.devices.break1})`);

  function deleteContactFunc() {
    deleteContact(currentUser.uid, currentUser.email, contactId);
  }

  function resetFunction() {
    const oldContactData = {
      name: name,
      time: time,
      timeFromLastTalk: timeFromLastTalk,
    };
    const newContactData = {
      name: name,
      time: time,
      timeFromLastTalk: currantTime,
    };
    updateContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      oldContactData,
      newContactData
    );
  }

  let lastTalkedToResponse;
  let isTalkingStatusOK;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    isTalkingStatusOK = true;
  } else {
    isTalkingStatusOK = false;
  }

  if (currantTime - timeFromLastTalk < 15000) {
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

  let nextTalkResponse;

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
          <ContactImage src="/default_image.svg" />
          <ContactDetailsSubDiv>
            <NameContainer>{name}</NameContainer>
            <TagContainer>{tag === null ? "" : tag}</TagContainer>
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
            tag={tag}
          />
        </MoreOptionsWrapper>
        <NotesButtonWrapper>
          <Notes
            name={name}
            notesArrayData={notesArray}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
            tag={tag}
          />
        </NotesButtonWrapper>
        <ButtonsWrapper>
          <ResetButton onClick={resetFunction}>Reset</ResetButton>
          <DeleteButton onClick={deleteContactFunc}>Delete</DeleteButton>
        </ButtonsWrapper>
      </ContactItemWrapper>
    </ContactItemContainer>
  );
}

ContactItem.propTypes = {
  name: propTypes.string,
  time: propTypes.number,
  timeFromLastTalk: propTypes.number,
  contactId: propTypes.string,
};
