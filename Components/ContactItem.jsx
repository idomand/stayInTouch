import React from "react";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import ContactEditModal from "./ContactEditModal";
import { resetTimerForContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import propTypes from "prop-types";
// import { useMedia } from "react-use";
import useStyledTheme from "../utils/hooks/useStyledTheme";
import { deleteContact } from "../lib/Firebase";
//*============================================================================================================
//?============================================================================================================

const ContactItemWrapper = styled.li`
  background-color: ${(element) => element.white};
  border: solid 1.5px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  margin: 10px 5px;
  border-radius: 10px;
  box-shadow: 9px 12px 19px -1px rgba(0, 0, 0, 0.5);
  @media (${({ theme }) => theme.devices.break2}) {
    width: 80%;
  }
`;

const ButtonContainer = styled.div`
  width: min-content;
  height: min-content;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResetButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.white};
  border: solid ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  margin: 5px 5px;
`;
const DeleteButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.black};
`;

const DataWrapper = styled.div`
  border-left: 1.5px ${({ theme }) => theme.black} solid;
  padding-left: 3px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-grow: 1;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-content: space-between;
  }
`;

const NameContainer = styled.span`
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
  width: 100px;
`;

const LastTalkedContainer = styled.div``;
const EmojiContainer = styled.div``;

const DeleteLogo = styled.img`
  height: 20px;
`;

const oneDay = 86400000;

const currantTime = new Date().getTime();

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
  // const isMobile = useMedia(`(${Theme.devices.break1})`);

  let colorType;
  if (type % 2 === 0) {
    colorType = Theme.boldGreen;
  } else {
    colorType = Theme.darkGreen;
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

  let lastTalkedToResponse;
  let lastTalkedToStatus;

  if (currantTime - timeCreated < time * oneDay) {
    lastTalkedToStatus = true;
  } else {
    lastTalkedToStatus = false;
  }

  if (currantTime - timeCreated < 0) {
    lastTalkedToResponse = <p>Last talk was today!</p>;
  } else {
    lastTalkedToResponse = (
      <p>
        Last talk was {Math.floor((currantTime - timeCreated) / oneDay)} days
        ago
      </p>
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
        <TimeContainer>Every: {time} days.</TimeContainer>
        <LastTalkedContainer>{lastTalkedToResponse}</LastTalkedContainer>
        <EmojiContainer>{lastTalkedToStatus ? "😎" : "😱"} </EmojiContainer>
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
