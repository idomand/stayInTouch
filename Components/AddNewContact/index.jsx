import React, { useRef, useState, useEffect } from "react";
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
