import React from "react";
import ContactEditModal from "./ContactEditModal";
import { resetTimerForContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import propTypes from "prop-types";
import { deleteContact } from "../lib/Firebase";
import { P } from "./Common/StyledText";
import { oneDay } from "../lib/ConstantsFile";

import styled from "styled-components";
import { BasicButton } from "./Common/StyledButton";

const ContactItemWrapper = styled.li`
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  @media (${({ theme }) => theme.devices.break2}) {
  }
`;

const ButtonContainer = styled.div`
  width: min-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  justify-content: space-around;
`;

const ResetButton = styled(BasicButton)``;

const DataWrapper = styled.div`
  display: grid;
  justify-content: space-around;
  grid-template-areas: "name howLong lastSpoke status";
  align-items: center;
  gap: 10px;
  border-left: 1.5px ${({ theme }) => theme.black} solid;
  flex-grow: 1;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-items: center;
    gap: 3px;
    padding: 10px;

    grid-template-areas:
      "name  status"
      "howLong lastSpoke";
  }
`;

const NameContainer = styled.span`
  grid-area: name;
  @media (${({ theme }) => theme.devices.break1}) {
    overflow: scroll;
  }
`;
const TimeContainer = styled.div`
  grid-area: howLong;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const LastTalkedContainer = styled.div`
  grid-area: lastSpoke;
`;

const StatusContainer = styled.div`
  grid-area: status;
  display: flex;
  align-items: center;
`;

const StatusPicture = styled.img`
  height: 30px;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const DeleteButton = styled(BasicButton)`
  &:hover,
  &:focus {
  }
`;

const DeleteLogo = styled.img`
  height: 20px;
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
    lastTalkedToResponse = <P>Last talk was today!</P>;
  } else {
    lastTalkedToResponse = (
      <P>
        Last talk was {Math.floor((currantTime - timeFromLastTalk) / oneDay)}{" "}
        days ago
      </P>
    );
  }

  return (
    <ContactItemWrapper>
      <ButtonContainer>
        <ResetButton onClick={resetFunction}>Reset</ResetButton>
        <ContactEditModal
          name={name}
          time={time}
          timeFromLastTalk={timeFromLastTalk}
          contactId={contactId}
        />

        <DeleteButton onClick={deleteContactFunc}>
          <DeleteLogo src="/trash.svg" alt="delete" />
        </DeleteButton>
      </ButtonContainer>
      <DataWrapper>
        <NameContainer> {name} </NameContainer>
        <TimeContainer>
          I want to talk to them every: {time} days.
        </TimeContainer>
        <LastTalkedContainer>{lastTalkedToResponse}</LastTalkedContainer>

        {lastTalkedToStatus ? (
          <StatusContainer>
            <P>Great!</P>
            <StatusPicture src="/win.jpg" />
          </StatusContainer>
        ) : (
          <StatusContainer>
            <P>Bad...</P>
            <StatusPicture src="/evil.jpg" />
          </StatusContainer>
        )}
      </DataWrapper>
    </ContactItemWrapper>
  );
}

ContactItem.propTypes = {
  name: propTypes.string,
  time: propTypes.number,
  timeFromLastTalk: propTypes.number,
  contactId: propTypes.string,
};
