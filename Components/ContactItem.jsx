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
  justify-content: space-between;
  list-style-type: none;
  border: solid 1.5px ${({ theme }) => theme.niceBrown};
  margin: 5px;
  border-radius: 10px;
  color: ${({ theme }) => theme.niceBrown};
`;

const ButtonContainer = styled.div`
  /* border: 1px solid blue; */
  width: min-content;
  height: min-content;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EditButton = styled(BasicButton)``;

const ResatButton = styled(BasicButton)``;

const DataWrapper = styled.div`
  border: 3px red dotted;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

const NameContainer = styled.span`
  border: 2px black solid;
  /* flex-grow: 1; */
  min-width: 60px;
`;
const TimeContainer = styled.div`
  border: 2px solid yellow;
  /* flex-grow: 1; */
`;

const LastTalkedContainer = styled.div`
  border: 2px solid lightcoral;
  /* flex-grow: 1; */
`;
const EmojiContainer = styled.div`
  border: 2px solid green;
  /* flex-grow: 1; */
`;

const oneDay = 86400000;

const currantTime = dayjs().valueOf();

//*--------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------
//*--------------------------------------------------------------------------------

export default function ContactItem({ name, time, timeCreated, id }) {
  const contactData = useContext(DataContext);

  const isMobile = useMedia("(max-width: 480px)");

  function editFunction() {
    console.log("edit");
    contactData.editContact(name);
  }
  function resatFunction() {
    contactData.resatTimer(id);
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
