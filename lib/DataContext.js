import React from "react";

const DataContext = React.createContext();

export const contactData = {
  contactArray: [
    { name: "ido", number: 1 },
    { name: "dana", number: 2 },
  ],
  addContact(data) {
    contactData.contactArray.push(data);
  },
  removeContact() {},
};

export default DataContext;
