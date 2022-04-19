import React, { useState, useEffect } from "react";
import { addContactToFirestore } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import ErrorWrapper from "../ErrorWarning";
import DatePickerComponent from "../DatePickerComponent";
import {
  AddContactForm,
  AddSubmitInput,
  LastTalkedLabel,
  NameInput,
  NameLabel,
  NotesInput,
  NotesLabel,
  TimeInput,
  TimeLabel,
} from "./AddNewContactStyle";

export default function AddNewContact() {
  const [time, setTime] = useState(3);
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [error, setError] = useState<string | boolean>(false);
  const [note, setNote] = useState("");

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

    let notesArray = [];

    if (note) {
      notesArray[0] = { id: 1, data: note };
    }
    let newContact = {
      name: name,
      time: time,
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

        <AddSubmitInput type="submit" value="Add contact" />
      </AddContactForm>
      {error && <ErrorWrapper errorMessage={error} />}
    </>
  );
}
