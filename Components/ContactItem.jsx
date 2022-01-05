import React, { useContext } from "react";
import styled from "styled-components";
import DataContext from "../lib/DataContext";

export default function ContactItem({ name }) {
  const contactData = useContext(DataContext);
  return (
    <li>
      <h3>the name is: {name}</h3>
    </li>
  );
}
