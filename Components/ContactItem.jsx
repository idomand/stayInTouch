import React from "react";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import ContactEditModal from "./ContactEditModal";
import { resetTimerForContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import propTypes from "prop-types";
import useStyledTheme from "../utils/hooks/useStyledTheme";
import { deleteContact } from "../lib/Firebase";
import { P } from "./Common/Text";
//*============================================================================================================
//?============================================================================================================

const ContactItemWrapper = styled.li`
  display: flex;
  justify-content: space-between;
  background-color: ${(element) => element.backgroundColor};
  color: ${({ theme }) => theme.black};
  list-style-type: none;
  margin: 10px 5px;
  border-radius: 10px;
  box-shadow: 4px 5px 12px 3px ${({ theme }) => theme.blue1};
  @media (${({ theme }) => theme.devices.break2}) {
    width: 80%;
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

const ResetButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue2};
  border: solid 2px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  margin: 5px 5px;
`;

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
  border: 2px ${({ theme }) => theme.black} dotted;
  border-radius: 10px;
  padding: 10px;
  font-weight: bold;
  min-width: 110px;
  text-decoration: underline;
  @media (${({ theme }) => theme.devices.break1}) {
    overflow: scroll;
    padding: 5px;
    max-width: 110px;
  }
`;
const TimeContainer = styled.div`
  width: 150px;
  grid-area: howLong;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 110px;
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
  border-radius: 50%;
  margin-left: 10px;
  height: 110px;
  width: 110px;

  @media (${({ theme }) => theme.devices.break1}) {
    width: 70px;
    height: 70px;
  }
`;

const DeleteButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue2};
  border: 2px solid ${({ theme }) => theme.black};
  margin: 5px 0;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
  }
`;

const DeleteLogo = styled.img`
  height: 20px;
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function ContactItem({
  name,
  time,
  timeCreated,
  contactId,
  type,
}) {
  const { currentUser } = useAuth();

  const Theme = useStyledTheme();

  let colorType;
  if (type % 2 === 0) {
    colorType = Theme.white;
  } else {
    colorType = Theme.white;
  }

  function deleteContactFunc() {
    deleteContact(currentUser.uid, currentUser.email, contactId);
  }

  function resetFunction() {
    const newContactData = {
      name: name,
      time: time,
      timeCreated: currantTime,
    };
    resetTimerForContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      newContactData
    );
  }

  const oneDay = 86400000;

  const currantTime = new Date().getTime();

  let lastTalkedToResponse;
  let lastTalkedToStatus;

  if (currantTime - timeCreated < time * oneDay) {
    lastTalkedToStatus = true;
  } else {
    lastTalkedToStatus = false;
  }

  if (currantTime - timeCreated < 0) {
    lastTalkedToResponse = <P>Last talk was today!</P>;
  } else {
    lastTalkedToResponse = (
      <P>
        Last talk was {Math.floor((currantTime - timeCreated) / oneDay)} days
        ago
      </P>
    );
  }

  return (
    <ContactItemWrapper backgroundColor={colorType}>
      <ButtonContainer>
        <ResetButton onClick={resetFunction}>Reset</ResetButton>
        <ContactEditModal
          name={name}
          time={time}
          timeCreated={timeCreated}
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
  timeCreated: propTypes.number,
  contactId: propTypes.string,
  type: propTypes.number,
};
