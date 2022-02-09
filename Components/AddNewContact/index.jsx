import React, { useRef, useState } from "react";
import { addDays } from "date-fns";

import { addContactToFirestore } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import ErrorWrapper from "../ErrorWarning";
import { P } from "../Common/StyledText";
import { BasicForm, BasicLabel } from "../Common/StyledFormElements";
import {
  InputText,
  DatePickerWrapper,
  InputTime,
  DatePickerComponent,
  AddSubmitInput,
  Calendar,
  Popper,
} from "./AddNewContactStyle";

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
      timeFromLastTalk: startDate.getTime(),
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
      <BasicForm onSubmit={createNewContact}>
        I would like to talk to:
        <BasicLabel>
          <InputText
            type="text"
            name="name"
            value={name}
            required
            onChange={nameChangeHandler}
          />
        </BasicLabel>
        <BasicLabel>
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
        </BasicLabel>
        <DatePickerWrapper>
          <P>Last time we have talked was:</P>
          <DatePickerComponent
            maxDate={addDays(new Date(), 0)}
            CalendarContainer={Calendar}
            popperContainer={Popper}
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <AddSubmitInput
            disabled={name === ""}
            type="submit"
            value="Add contact"
          />
        </DatePickerWrapper>
      </BasicForm>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}
