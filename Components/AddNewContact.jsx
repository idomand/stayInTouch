import React, { useRef, useState, useContext } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import DataContext from "../lib/DataContext";

const Input = styled.input`
  /* width: 50px; */
`;
const InputText = styled(Input)`
  min-width: 70px;
  margin: 5px;
`;
const InputTime = styled(Input)`
  width: 30px;
  margin: 5px;
`;
const InputSubmit = styled(Input)`
  padding: 10px;
  /* width: 50px; */
  margin-left: 10px;
  border-radius: 10px;
  color: ${({ theme }) => theme.secondaryColor};
  background-color: ${({ theme }) => theme.niceBrown};
  font-weight: bolder;
`;

const Form = styled.form`
  color: ${({ theme }) => theme.niceBrown};
  margin: 10px;
`;

export default function AddNewContact() {
  const nameRef = useRef();
  const timeRef = useRef();
  const contactData = useContext(DataContext);

  function createNewContact(event) {
    event.preventDefault();
    let newContact = {
      name: nameRef.current.value,
      time: timeRef.current.value,
      timeCreated: dayjs().valueOf(),
      id: Math.floor(Math.random() * 10000),
    };
    contactData.addContact(newContact);
    nameRef.current.value = "";
    timeRef.current.value = 3;
  }
  return (
    <div>
      <Form onSubmit={createNewContact}>
        I would like to talk to:
        <label>
          <InputText ref={nameRef} type="text" name="name" required />
        </label>
        <label>
          every
          <InputTime
            ref={timeRef}
            type="number"
            name="time"
            id="time"
            max={31}
            min={1}
            defaultValue={3}
          />
          days
        </label>
        <InputSubmit type="submit" value="Add contact" />
      </Form>
    </div>
  );
}
