import React from "react";
import styled from "styled-components";
import NavBar from "./NavBar";
import ScrollButtonWrapper from "./ScrollToTopButton";
import propTypes from "prop-types";

//*============================================================================================================
//?============================================================================================================

const LayoutWrapper = styled.div``;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================
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
