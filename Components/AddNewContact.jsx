import React, { useRef, useContext } from "react";
import DataContext from "../lib/DataContext";

export default function AddNewContact() {
  const nameRef = useRef();
  const contactData = useContext(DataContext);

  function createNewContact(event) {
    event.preventDefault();
    contactData.addContact({ name: nameRef.current.value });
    nameRef.current.value = "";
  }
  return (
    <div>
      <form onSubmit={createNewContact}>
        <label>
          Name:
          <input ref={nameRef} type="text" name="name" required />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
