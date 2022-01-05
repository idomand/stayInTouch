import { useState } from "react";
import styled from "styled-components";
import ContactDetails from "../Components/ContactDetails";
import MainForm from "../Components/MainForm";
import NavBar from "../Components/NavBar";

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
    { name: "ido", time: 1 },
    { name: "dana", time: 2 },
  ]);

  const contactData = {
    contactArray: contactArray,
    addContact(data) {
      setContactArray((contactArray) => [...contactArray, data]);
    },
    removeContact() {},
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
