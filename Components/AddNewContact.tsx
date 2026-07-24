import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { addContactToFirestore } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import ErrorWrapper from "./ErrorWarning";
import DatePickerComponent from "./DatePickerComponent";
import { BasicForm, BasicLabel } from "./Common/StyledFormElements";
import { BasicInput, InputSubmit } from "./Common/StyledFormElements";

export default function AddNewContact() {
  const [time, setTime] = useState(3);
  const { currentUser } = useAuth()!;
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState<string | boolean>(false);
  const [note, setNote] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (error) {
      setError(false);
    }
  }

  async function createNewContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentUser == null || currentUser.email == null) return;
    let notesArray = [];

    if (note) {
      notesArray[0] = { noteId: 1, data: note };
    }
    let newContact = {
      name: name,
      time: time,
      timeFromLastTalk: startDate.getTime(),
      notesArray: notesArray,
      friendEmail: friendEmail,
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
      setTime(3);
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
            value={time}
            onChange={(e) => {
              setTime(+e.target.value);
            }}
            type="number"
            name="time"
            id="time"
            max={31}
            min={1}
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
        <EmailInputLabel>
          friend Email (optional)
          <EmailInput
            placeholder="new-friend@friendship.com"
            value={friendEmail}
            onChange={(e) => {
              setFriendEmail(e.target.value);
            }}
            type="email"
          />
        </EmailInputLabel>

        <AddSubmitInput type="submit" value="Add contact" />
      </AddContactForm>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}

const AddContactForm = styled(BasicForm)`
  max-width: 50%;
  margin: auto;
  display: grid;
  padding: 15px;
  gap: 5px;
  width: auto;
  grid-template-areas:
    "name howMuchTime howMuchTime"
    "lastTalked notes notes"
    "emailInput emailInput emailInput"
    "submit submit submit";

  @media (${({ theme }) => theme.devices.break1}) {
    max-width: 100%;
    padding: 10px 5px;
    width: 85vw;
    gap: 0;
    grid-template-areas:
      "name howMuchTime"
      "lastTalked lastTalked"
      "notes notes"
      "emailInput emailInput "
      "submit submit";
  }
`;

const NameLabel = styled(BasicLabel)`
  grid-area: name;
  @media (${({ theme }) => theme.devices.break1}) {
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
      /* top: 50px; */
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
  &:focus {
    border: 1px solid ${({ theme }) => theme.blue1};
  }
`;

const EmailInputLabel = styled(BasicLabel)`
  grid-area: emailInput;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
const EmailInput = styled(BasicInput)`
  grid-area: emailInput;
  border: 1px solid ${({ theme }) => theme.grey2};
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
