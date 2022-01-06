import React, { useContext } from "react";
import styled from "styled-components";
import DataContext from "../lib/DataContext";
import dayjs from "dayjs";
import { useMedia } from "react-use";
import { BasicButton } from "./Common/Button";

//*--------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------
//*--------------------------------------------------------------------------------

const ContactItemWrapper = styled.li`
  display: flex;
  list-style-type: none;
  border: solid red;
  margin-top: 5px;
  color: white;
  @media (max-width: 480px) {
    color: red;
  }
`;

const ButtonContainer = styled.div`
  border: solid blue;
  width: min-content;
  height: min-content;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EditButton = styled(BasicButton)``;

const ResatButton = styled(BasicButton)``;

const DataWrapper = styled.div`
  border: wheat solid;
  display: flex;
`;

const NameContainer = styled.span`
  border: black solid;
`;
const TimeContainer = styled.div`
  border: solid yellow;
`;

const LastTalkedContainer = styled.div`
  border: solid lightcoral;
`;
const EmojiContainer = styled.div`
  border: solid green;
`;

const oneDay = 86400000;

const currantTime = dayjs().valueOf();

//*--------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------
//*--------------------------------------------------------------------------------

export default function ContactItem({ name, time, timeCreated }) {
  const contactData = useContext(DataContext);

  const isMobile = useMedia("(max-width: 480px)");

  function editFunction() {
    console.log("edit");
    contactData.editContact(name);
  }
  function resatFunction() {
    contactData.resatTimer(name);
  }

  let flag;
  if (currantTime - timeCreated < time * oneDay) {
    flag = true;
  } else {
    flag = false;
  }

  let lastTalkedToResponse;

  if (currantTime - timeCreated < 0) {
    lastTalkedToResponse = <p>We talked today</p>;
  } else {
    lastTalkedToResponse = (
      <p>
        have not talked in {Math.floor((currantTime - timeCreated) / oneDay)}{" "}
        days
      </p>
    );
  }

  return (
    <ContactItemWrapper>
      <ButtonContainer>
        <EditButton onClick={editFunction}>edit</EditButton>
        <ResatButton onClick={resatFunction}>resat</ResatButton>
      </ButtonContainer>
      <DataWrapper>
        <NameContainer> {name}.</NameContainer>
        <TimeContainer>days: {time}.</TimeContainer>
        <LastTalkedContainer>{lastTalkedToResponse}</LastTalkedContainer>
        <EmojiContainer>
          {flag ? <p>Great</p> : <p>Talk To them</p>}{" "}
        </EmojiContainer>
      </DataWrapper>
    </ContactItemWrapper>
  );
}
