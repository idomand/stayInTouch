import React, { useRef, useState, useContext } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import DataContext from "../lib/DataContext";

const Input = styled.input`
  width: 50px;
`;
const InputText = styled(Input)`
  min-width: 70px;
`;
const InputTime = styled(Input)`
  width: 30px;
`;
const InputSubmit = styled(Input)`
  width: 50px;
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
    };
    contactData.addContact(newContact);
    console.log("newContact :>> ", newContact);
    nameRef.current.value = "";
    timeRef.current.value = 3;
  }
  return (
    <div>
      <form onSubmit={createNewContact}>
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
        <InputSubmit type="submit" value="add" />
      </form>
    </div>
  );
}
