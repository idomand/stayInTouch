import React from "react";
import NavBar from "./NavBar";
import ScrollButtonWrapper from "./ScrollToTopButton";
import propTypes from "prop-types";
import styled from "styled-components";

const LayoutWrapper = styled.div``;

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
