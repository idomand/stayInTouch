import React from "react";
import { resetTimerForContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import propTypes from "prop-types";
import { deleteContact } from "../lib/Firebase";
import { oneDay } from "../lib/ConstantsFile";
import styled from "styled-components";
import { BasicButton } from "./Common/StyledButton";
import MoreOptions from "./MoreOptions";

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
const NotesButton = styled.button`
  cursor: pointer;
  height: 40px;
  background-color: ${({ theme }) => theme.blue3};
  border: none;
  border-radius: 55px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.grey2};
  }
`;

const NotsNumber = styled.div`
  border-radius: 38px;
  text-align: center;
  font-weight: 600;
  height: 18px;
  width: 18px;
  position: absolute;
  bottom: 25px;
  left: 30px;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  transition: all 0.3s;
  border: solid 1px transparent;

  ${NotesButton}:hover &,
  ${NotesButton}:focus & {
    background-color: ${({ theme }) => theme.white};
    border: solid 1px ${({ theme }) => theme.blue1};

    color: ${({ theme }) => theme.blue1};
  }
`;

const NotesLogo = styled.img`
  display: block;
  margin-left: 5px;
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
}) {
  const { currentUser } = useAuth();

  function deleteContactFunc() {
    deleteContact(currentUser.uid, currentUser.email, contactId);
  }

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
  let lastTalkedToStatus;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    lastTalkedToStatus = true;
  } else {
    lastTalkedToStatus = false;
  }

  if (currantTime - timeFromLastTalk < 0) {
    lastTalkedToResponse = <DateValue>Last talk was today!</DateValue>;
  } else {
    lastTalkedToResponse = (
      <DateValue>
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)} days ago
      </DateValue>
    );
  }

  return (
    <ContactItemContainer>
      <EmojiWrapper>{lastTalkedToStatus ? "😎" : "😡"}</EmojiWrapper>
      <ContactItemWrapper>
        <ContactDetailsWrapper>
          <ContactImage src="/default_image.svg" />
          <ContactDetailsSubDiv>
            <NameContainer>{name}</NameContainer>
            <TagContainer>Family</TagContainer>
          </ContactDetailsSubDiv>
        </ContactDetailsWrapper>
        <ContactDatesWrapper>
          <DateWrapper>
            <DateHeader>Talk Every</DateHeader>
            <DateValue>{time} days</DateValue>
          </DateWrapper>
          <DateWrapper>
            <DateHeader>Last Talk</DateHeader>
            <DateValue>{lastTalkedToResponse}</DateValue>
          </DateWrapper>
          <DateWrapper>
            <DateHeader>Next Talk</DateHeader>
            <DateValue>5 days</DateValue>
          </DateWrapper>
        </ContactDatesWrapper>
        <ContactButtonsWrapper>
          <MoreOptionsWrapper>
            <MoreOptions
              name={name}
              time={time}
              timeFromLastTalk={timeFromLastTalk}
              contactId={contactId}
            />
          </MoreOptionsWrapper>
          <ButtonsWrapper>
            <NotesButton>
              <NotsNumber>2</NotsNumber>
              <NotesLogo src="/notes.svg" />
            </NotesButton>
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
