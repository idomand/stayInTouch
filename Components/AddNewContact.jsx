import React, { useState, useRef, useContext } from "react";
import DataContext from "../lib/DataContext";

export default function AddNewContact() {
  const nameRef = useRef();
  const contactData = useContext(DataContext);
  const [state, setState] = useState("");

  console.log("state :>> ", state);

  function createNewContact(event) {
    event.preventDefault();
    contactData.addContact({ name: nameRef.current.value });
    setState("");
    console.log("contactData.contactArray", contactData.contactArray);
  }
  return (
    <div>
      <form onSubmit={createNewContact}>
        <label>
          Name:
          <input ref={nameRef} type="text" name="name" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
