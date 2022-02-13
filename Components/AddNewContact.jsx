import React, { useRef, useState } from "react";
import styled from "styled-components";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addContactToFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ErrorWrapper from "./ErrorWarning";
import { P } from "./Common/StyledText";
import { BasicForm, BasicLabel } from "./Common/StyledFormElements";
import { BasicInput, InputSubmit } from "./Common/StyledFormElements";

const AddContactForm = styled(BasicForm)`
  display: grid;
  padding: 15px;
  grid-template-areas:
    "name howMuchTime tag"
    "lastTalked notes"
    "submit";
  width: 50vw;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 90vw;
    grid-template-areas:
      "name howMuchTime "
      "tag lastTalked "
      "notes"
      "submit";
  }
`;

// const InputText = styled(BasicInput)``;
// const InputTime = styled(BasicInput)``;

const NameLabel = styled(BasicLabel)`
  border: dotted blue;
`;
const NameInput = styled(BasicInput)`
  border: solid blue;
`;
const TagLabel = styled(BasicLabel)`
  border: dotted green;
`;
const TagInput = styled(BasicInput)`
  border: solid green;
`;
const TimeLabel = styled(BasicLabel)`
  border: dotted yellow;
`;

const TimeInput = styled(BasicInput)`
  border: solid yellow;
`;

const NotesLabel = styled(BasicLabel)`
  border: dotted orange;
`;

const NotesInput = styled(BasicInput)`
  border: solid orange;
`;

const AddSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.green_1};
  color: ${({ theme }) => theme.white};
  transition: all 0.5s;
  &:hover,
  &:focus {
    background: rgba(2, 207, 96, 0.1);
    border: 1.3px solid ${({ theme }) => theme.green_1};
    color: ${({ theme }) => theme.green_1};
  }
`;

const DatePickerWrapper = styled.div`
  grid-area: lastTalked;

  display: flex;
  justify-content: space-between;
  align-items: center;
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
  }
`;

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
      <AddContactForm onSubmit={createNewContact}>
        <NameLabel>
          I would like to talk to:
          <NameInput
            type="text"
            name="name"
            value={name}
            required
            onChange={nameChangeHandler}
            placeholder="Enter name"
          />
        </NameLabel>
        <BasicLabel>
          every
          <TimeInput
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
      </AddContactForm>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}
