import React, { useRef, useState, useContext } from "react";
import DataContext from "../lib/DataContext";

export default function AddNewContact() {
  const [time, setTime] = useState(3);
  const nameRef = useRef();
  const timeRef = useRef();
  const contactData = useContext(DataContext);

  function createNewContact(event) {
    event.preventDefault();
    let newContact = {
      name: nameRef.current.value,
      time: timeRef.current.value,
    };
    contactData.addContact(newContact);
    console.log("newContact :>> ", newContact);
    nameRef.current.value = "";
    timeRef.current.value = 1;
  }
  return (
    <div>
      <form onSubmit={createNewContact}>
        I would like to talk to:
        <label>
          <input ref={nameRef} type="text" name="name" required />
        </label>
        <label>
          every
          <input
            ref={timeRef}
            type="number"
            name="time"
            id="time"
            max={31}
            min={1}
          />
          days
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
