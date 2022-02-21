import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { addContactToFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ErrorWrapper from "./ErrorWarning";
import { BasicForm, BasicLabel } from "./Common/StyledFormElements";
import { BasicInput, InputSubmit } from "./Common/StyledFormElements";
import DatePickerComponent from "./DatePickerComponent";

const AddContactForm = styled(BasicForm)`
  display: grid;
  padding: 15px;
  gap: 5px;
  grid-template-areas:
    "name howMuchTime howMuchTime"
    "lastTalked notes notes"
    "submit submit submit";

  width: auto;

  @media (${({ theme }) => theme.devices.break1}) {
    padding: 10px 5px;
    width: 85vw;
    gap: 0;
    grid-template-areas:
      "name howMuchTime"
      "lastTalked lastTalked"
      "notes notes"
      "submit submit";
  }
`;

const NameLabel = styled(BasicLabel)`
  grid-area: name;
  @media (${({ theme }) => theme.devices.break1}) {
    max-width: 120px;
  }
`;
const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
`;

const TimeLabel = styled(BasicLabel)`
  grid-area: howMuchTime;
  position: relative;
  &:after {
    content: "Days" attr(data-domain);
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: ${({ theme }) => theme.grey3};
    font-weight: bold;
  }

  @media (${({ theme }) => theme.devices.break1}) {
    &::after {
      top: 50px;
    }
  }
`;

const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
`;

const LastTalkedLabel = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
  grid-area: lastTalked;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const NotesLabel = styled(BasicLabel)`
  grid-area: notes;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const NotesInput = styled.textarea`
  border: 1px solid ${({ theme }) => theme.grey2};

  border-radius: 8px;
  height: 30px;
  background-color: ${({ theme }) => theme.grey1};
`;

const AddSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.green1};
  color: ${({ theme }) => theme.white};
  transition: all 0.5s;
  height: 40px;
  margin: 0px 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.green3};

    border: 1.3px solid ${({ theme }) => theme.green1};
    color: ${({ theme }) => theme.green1};
  }
`;

export default function AddNewContact() {
  const timeRef = useRef();
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        console.log("2");
        setError(false);
      }, 2000);
    }
  }, [error]);

  function nameChangeHandler(e) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(event) {
    event.preventDefault();

    let notesArray = [];

    if (note) {
      notesArray[0] = { id: 1, data: note };
    }

    let newContact = {
      name: name,
      time: +timeRef.current.value,
      timeFromLastTalk: startDate.getTime(),
      notesArray: notesArray,
    };

    const result = await addContactToFirestore(
      currentUser.uid,
      currentUser.email,
      newContact
    );
    if (result === "bad") {
      setError("contact already in list");
      setName("");
    } else {
      setNote("");
      setStartDate(new Date());
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
            placeholder="Enter Name"
            name="name"
            value={name}
            required
            onChange={nameChangeHandler}
          />
        </NameLabel>
        <TimeLabel>
          Every
          <TimeInput
            ref={timeRef}
            type="number"
            name="time"
            id="time"
            max={31}
            min={1}
            defaultValue={3}
          />
        </TimeLabel>

        <LastTalkedLabel>
          Last Time We Have Spoken
          <DatePickerComponent
            setStartDate={setStartDate}
            startDate={startDate}
          />
        </LastTalkedLabel>

        <NotesLabel>
          Add a Note (optional)
          <NotesInput
            placeholder="Enter Note..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
          />
        </NotesLabel>

        <AddSubmitInput
          disabled={name === ""}
          type="submit"
          value="Add contact"
        />
      </AddContactForm>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}
