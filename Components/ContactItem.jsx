import React from "react";
import { resetTimerForContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import propTypes from "prop-types";
import { deleteContact } from "../lib/Firebase";
import { oneDay } from "../lib/ConstantsFile";
import styled from "styled-components";
import { BasicButton } from "./Common/StyledButton";
import MoreOptions from "./MoreOptions";
import Notes from "./Notes";

const ContactItemContainer = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 85vw;
  list-style-type: none;
  margin: 10px 5px;
`;
const ContactItemWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.white};
  border-radius: 15px;
  padding: 10px;
  @media (${({ theme }) => theme.devices.break2}) {
  }
`;

const EmojiWrapper = styled.div`
  margin-right: 10px;
`;

const ContactDetailsWrapper = styled.div`
  display: flex;
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

  @media (${({ theme }) => theme.devices.break1}) {
    overflow: scroll;
  }
`;
const TagContainer = styled.span`
  color: ${({ theme }) => theme.blue2};
  font-weight: 400;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  line-height: 21px;
`;

const ContactImage = styled.img`
  margin-right: 15px;
`;

const ContactDatesWrapper = styled.div`
  display: flex;
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
    console.log("statusColor :>> ", statusColor);
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

const ContactButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MoreOptionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
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
  function deleteContactFunc() {
    deleteContact(currentUser.uid, currentUser.email, contactId);
  }
  console.log("tag :>> ", tag);
  function resetFunction() {
    const newContactData = {
      name: name,
      time: time,
      timeFromLastTalk: currantTime,
    };
    resetTimerForContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      newContactData
    );
  }

  const currantTime = new Date().getTime();

  let lastTalkedToResponse;
  let isTalkingStatusOK;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    isTalkingStatusOK = true;
  } else {
    isTalkingStatusOK = false;
  }

  if (currantTime - timeFromLastTalk < 0) {
    lastTalkedToResponse = (
      <DateValue statusColor={isTalkingStatusOK}>
        Last talk was today!
      </DateValue>
    );
  } else {
    lastTalkedToResponse = (
      <DateValue statusColor={isTalkingStatusOK}>
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)} days ago
      </DateValue>
    );
  }

  return (
    <ContactItemContainer>
      <EmojiWrapper>{isTalkingStatusOK ? "😎" : "😡"}</EmojiWrapper>
      <ContactItemWrapper>
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
            <DateHeader>Next Talk</DateHeader>
            <DateValue statusColor={isTalkingStatusOK}>5 days</DateValue>
          </DateWrapper>
        </ContactDatesWrapper>
        <ContactButtonsWrapper>
          <MoreOptionsWrapper>
            <MoreOptions
              name={name}
              time={time}
              timeFromLastTalk={timeFromLastTalk}
              contactId={contactId}
              tag={tag}
            />
          </MoreOptionsWrapper>
          <ButtonsWrapper>
            <Notes name={name} notesArrayData={notesArray} />

            <ResetButton onClick={resetFunction}>Reset</ResetButton>
            <DeleteButton onClick={deleteContactFunc}>Delete</DeleteButton>
          </ButtonsWrapper>
        </ContactButtonsWrapper>
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
