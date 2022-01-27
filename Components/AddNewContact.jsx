import React, { useRef, useState } from "react";
import styled, { css, createGlobalStyle } from "styled-components";
import { addContactToFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import { BasicTextInput } from "./Common/Input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//*============================================================================================================
//?============================================================================================================

const Input = styled.input``;

const InputText = styled(BasicTextInput)`
  min-width: 70px;
  margin: 5px;
`;
const InputTime = styled(BasicTextInput)`
  width: 45px;
  margin: 5px;
`;
const InputSubmit = styled(Input)`
  padding: 10px;
  margin-left: 10px;
  border-radius: 10px;
  color: ${({ theme }) => theme.boldRed};
  background-color: ${({ theme }) => theme.niceBrown};
  font-weight: bolder;
`;

const Form = styled.form`
  color: ${({ theme }) => theme.niceBrown};
  margin: 10px;
`;

const DatePickerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DatePickerComponent = styled(({ className, ...props }) => (
  <DatePicker {...props} wrapperClassName={className} />
))`
  width: 90px;

  & .react-datepicker__input-container {
    width: 90px;
  }
  & .react-datepicker__input-container input {
    width: 90px;

    border-radius: 5px;
    background-color: lavender;
  }
`;

const Calendar = styled.div`
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(27, 37, 86, 0.16);
  overflow: hidden;
`;
const Popper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

const ErrorWrapper = styled.div`
  border: solid red;
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function AddNewContact() {
  const timeRef = useRef();
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState(false);

  function nameChangeHandler(e) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(event) {
    event.preventDefault();

    let newContact = {
      name: name,
      time: +timeRef.current.value,
      timeCreated: startDate.getTime(),
    };

    const result = await addContactToFirestore(
      currentUser.uid,
      currentUser.email,
      newContact
    );
    if (result === "bad") {
      setError("contact already in list");
    } else {
      setName("");
      timeRef.current.value = 3;
    }
  }
  return (
    <>
      <Form onSubmit={createNewContact}>
        I would like to talk to:
        <label>
          <InputText
            type="text"
            name="name"
            value={name}
            required
            onChange={nameChangeHandler}
          />
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
        <DatePickerWrapper>
          <p>lest time we have talked was:</p>
          <DatePickerComponent
            CalendarContainer={Calendar}
            popperContainer={Popper}
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <InputSubmit type="submit" value="Add contact" />
        </DatePickerWrapper>
      </Form>
      {error && (
        <ErrorWrapper>
          <h2>error: {error}</h2>
        </ErrorWrapper>
      )}
    </>
  );
}
