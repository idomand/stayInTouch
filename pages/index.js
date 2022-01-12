import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";
import ContactDetails from "../Components/ContactDetails";
import MainForm from "../Components/MainForm";
import dayjs from "dayjs";
import DataContext from "../lib/DataContext";
import { useAuth } from "../lib/AuthContext";
import Layout from "../Components/Layout";
//?=======================================================
//?=======================================================

export default function Home() {
  const router = useRouter();

  const { currentUser } = useAuth();

  const [user, setUser] = useState(currentUser);

  useEffect(() => {
    if (currentUser) {
      console.log("there is a user: " + currentUser.displayName);
    } else {
      console.log("there is no user");
      router.push("/login");
    }
  }, [currentUser, router]);

  console.log(`currentUser`, currentUser);
  const [contactArray, setContactArray] = useState([
    { name: "poopLord", time: 3, timeCreated: 1641227473000, id: 5 },
    { name: "ido", time: 3, timeCreated: 1641118511111, id: 1 },
    { name: "david", time: 3, timeCreated: 1641118522222, id: 2 },
    { name: "dana", time: 14, timeCreated: 1640513733333, id: 3 },
    { name: "bob", time: 7, timeCreated: 1639563344444, id: 4 },
  ]);

  const authContextData = {
    checkUser(newUser) {
      setUser(newUser);
    },
  };

  const contactData = {
    contactArray: contactArray,
    addContact(data) {
      setContactArray((contactArray) => [...contactArray, data]);
    },
    deleteContactFunc(id) {
      setContactArray(this.contactArray.filter((element) => element.id !== id));
    },
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
    editContactName(id, name) {
      const newArray = this.contactArray.map((element) => {
        if (element.id === id) {
          return (element = { ...element, name: name });
        } else {
          return element;
        }
      });
      setContactArray(newArray);
    },
    editContactTime(id, time) {
      const newArray = this.contactArray.map((element) => {
        if (element.id === id) {
          return (element = { ...element, time: time });
        } else {
          return element;
        }
      });
      setContactArray(newArray);
    },
  };

  return (
    <DataContext.Provider value={contactData}>
      <Layout>
        <h1>this is home</h1>
        <MainForm />
        <ContactDetails />
      </Layout>
    </DataContext.Provider>
  );

  // return (
  //   <DataContext.Provider value={contactData}>
  //     <Layout>
  //       <h1>this is home</h1>
  //       {currentUser ? (
  //         <>
  //           {" "}
  //           <MainForm />
  //           <ContactDetails />
  //         </>
  //       ) : (
  //         <>
  //           {" "}
  //           <Login />
  //         </>
  //       )}
  //     </Layout>
  //   </DataContext.Provider>
  // );
}
