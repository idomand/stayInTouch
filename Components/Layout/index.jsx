import React from "react";
import NavBar from "../NavBar";
import ScrollButtonWrapper from "../ScrollToTopButton";
import propTypes from "prop-types";
import { LayoutWrapper } from "./LayoutStyle";

export default function Layout({ children }) {
  return (
    <LayoutWrapper>
      <NavBar />

      {children}
      <ScrollButtonWrapper />
    </LayoutWrapper>
  );
}

LayoutWrapper.propTypes = {
  children: propTypes.any,
};
