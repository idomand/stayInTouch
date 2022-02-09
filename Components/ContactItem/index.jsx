import React from "react";
import ContactEditModal from "../ContactEditModal";
import { resetTimerForContact } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import propTypes from "prop-types";
import { deleteContact } from "../../lib/Firebase";
import { P } from "../Common/StyledText";
import { oneDay } from "../../lib/ConstantsFile";
import {
  ButtonContainer,
  ContactItemWrapper,
  DataWrapper,
  DeleteButton,
  DeleteLogo,
  LastTalkedContainer,
  NameContainer,
  ResetButton,
  StatusContainer,
  StatusPicture,
  TimeContainer,
} from "./ContactItemStyle";

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
