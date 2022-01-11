import React, { useContext } from "react";
import styled from "styled-components";
import DataContext from "../lib/DataContext";
import dayjs from "dayjs";
// import { useMedia } from "react-use";
import { BasicButton } from "./Common/Button";
import ContactEditModal from "./ContactEditModal";

//*--------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------
//*--------------------------------------------------------------------------------

const ContactItemWrapper = styled.li`
  background-color: ${(element) => element.backgroundColor};
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  border: solid 1.5px ${({ theme }) => theme.niceBrown};
  margin: 10px 5px;
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
  border-left: 1.5px ${({ theme }) => theme.niceBrown} solid;
  padding-left: 3px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-grow: 1;
  @media (max-width: 480px) {
    justify-content: space-between;
  }
`;

const NameContainer = styled.span`
  border: 2px black solid;
  padding: 5px;
  font-weight: bold;
  /* flex-grow: 1; */
  min-width: 110px;
  text-decoration: underline;
`;
const TimeContainer = styled.div`
  /* border: 2px solid yellow; */
  width: 100px;
  /* margin: 5px; */
  /* flex-grow: 1; */
`;

const LastTalkedContainer = styled.div`
  /* border: 2px solid lightcoral; */
  /* flex-grow: 1; */
`;
const EmojiContainer = styled.div`
  /* border: 2px solid green; */
  /* flex-grow: 1; */
`;

const oneDay = 86400000;

const currantTime = dayjs().valueOf();

//*--------------------------------------------------------------------------------
//!--------------------------------------------------------------------------------
//*--------------------------------------------------------------------------------

export default function ContactItem({ name, time, timeCreated, id, type }) {
  const contactData = useContext(DataContext);

  let colorType;

  if (type % 2 === 0) {
    colorType = "#1C5340";
  } else {
    colorType = "#003E29";
  }

  // const isMobile = useMedia("(max-width: 480px)");

  function resatFunction() {
    contactData.resatTimer(id);
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
        <ContactEditModal
          name={name}
          time={time}
          timeCreated={timeCreated}
          id={id}
        />
        <ResatButton onClick={resatFunction}>Reset</ResatButton>
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