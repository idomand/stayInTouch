import { useState } from "react";
import styled from "styled-components";
import ContactDetails from "../Components/ContactDetails";
import MainForm from "../Components/MainForm";
import NavBar from "../Components/NavBar";
import dayjs from "dayjs";

import DataContext from "../lib/DataContext";

//* ===========================================
//! ===========================================
//* ===========================================

const HomeWrapper = styled.section`
  background-color: ${({ theme }) => theme.BackgroundColor};
  height: 100vh;
`;

export default function Home() {
  const [contactArray, setContactArray] = useState([
    { name: "poopLord", time: 3, timeCreated: 1641227473000, id: 5 },
    { name: "ido", time: 3, timeCreated: 1641118511111, id: 1 },
    { name: "david", time: 3, timeCreated: 1641118522222, id: 2 },
    { name: "dana", time: 14, timeCreated: 1640513733333, id: 3 },

    { name: "bob", time: 7, timeCreated: 1639563344444, id: 4 },
  ]);

  const contactData = {
    contactArray: contactArray,

    addContact(data) {
      setContactArray((contactArray) => [...contactArray, data]);
    },
    removeContact() {},

    resatTimer(id) {
      const newTimeCreated = dayjs().valueOf();
      const contactObject = this.contactArray.find(
        (element) => element.id === id
      );
      contactObject.timeCreated = newTimeCreated;
      const newArray = this.contactArray.map((element) => {
        if (element.id === id) {
          element = { ...element, timeCreated: newTimeCreated };
          return element;
        } else {
          return element;
        }
      });
      setContactArray(newArray);
    },

    editContact(name) {},
  };

  return (
    <HomeWrapper>
      <DataContext.Provider value={contactData}>
        <NavBar />
        <MainForm />
        <ContactDetails />
      </DataContext.Provider>
    </HomeWrapper>
  );
}
