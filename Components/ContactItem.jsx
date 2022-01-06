import React, { useContext } from "react";
import styled from "styled-components";
import DataContext from "../lib/DataContext";
import dayjs from "dayjs";

const ContactItemWrapper = styled.li`
  list-style-type: none;
  border: solid red;
  margin-top: 5px;
  color: white;
`;
const oneDay = 86400000;

const currantTime = dayjs().valueOf();

export default function ContactItem({ name, time, timeCreated }) {
  // const contactData = useContext(DataContext);

  let flag;
  if (currantTime - timeCreated > time * oneDay) {
    flag = false;
  } else {
    flag = true;
  }

  return (
    <ContactItemWrapper>
      <h4>
        Name: {name}. days: {time}. timeCreated: {timeCreated}
      </h4>
      {flag ? <h3>True</h3> : <h3>False</h3>}
    </ContactItemWrapper>
  );
}
