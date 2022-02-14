import React, { useRef, useState } from "react";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
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
    "name howMuchTime tag"
    "lastTalked notes notes"
    "submit submit submit";

  width: 50vw;
  @media (${({ theme }) => theme.devices.break1}) {
    padding: 10px 5px;
    width: 95vw;
    grid-template-areas:
      "name howMuchTime "
      "tag lastTalked "
      "notes notes"
      "submit submit";
  }
`;

const NameLabel = styled(BasicLabel)`
  grid-area: name;
`;
const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey_2};
`;

const TimeLabel = styled(BasicLabel)`
  grid-area: howMuchTime;
  position: relative;
  &::after {
    content: "Days" attr(data-domain);
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: bold;
  }
`;

const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey_2};

  border-radius: 8px;
`;
const TagLabel = styled(BasicLabel)`
  grid-area: tag;
`;
const TagInput = styled.select`
  border: 1px solid ${({ theme }) => theme.grey_2};

  border-radius: 8px;
  height: 30px;

  background-color: ${({ theme }) => theme.grey_1};
`;
const TagOption = styled.option`
  background-color: goldenrod;
  border: blue solid;
`;

const LastTalkedLabel = styled(BasicLabel)`
  grid-area: lastTalked;
  align-items: center;
`;

const NotesLabel = styled(BasicLabel)`
  grid-area: notes;
`;

const NotesInput = styled.textarea`
  border: 1px solid ${({ theme }) => theme.grey_2};

  border-radius: 8px;
  height: 30px;
  background-color: ${({ theme }) => theme.grey_1};
`;

const AddSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.green_1};
  color: ${({ theme }) => theme.white};
  transition: all 0.5s;
  height: 40px;
  margin: 0px 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.green_3};

    border: 1.3px solid ${({ theme }) => theme.green_1};
    color: ${({ theme }) => theme.green_1};
  }
`;

export default function AddNewContact() {
  const timeRef = useRef();
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState(false);
  const [tagValue, setTagValue] = useState("");
  const [note, setNote] = useState("");
  console.log("tagValue :>> ", tagValue);
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
        <TagLabel>
          Add a Tag:
          <TagInput
            onChange={(e) => {
              setTagValue(e.target.value);
            }}
          >
            <TagOption>select</TagOption>
            <TagOption>Coworker</TagOption>
            <TagOption>Friend</TagOption>
            <TagOption>Family</TagOption>
            <TagOption>Other</TagOption>
          </TagInput>
        </TagLabel>

        <LastTalkedLabel>
          Last Time We Have Spoken
          <DatePickerComponent
            setStartDate={setStartDate}
            startDate={startDate}
          />
        </LastTalkedLabel>

        <NotesLabel>
          Add a Note
          <NotesInput
            placeholder="Enter Note (optional)"
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
