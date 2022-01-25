import React from "react";
import styled from "styled-components";
import NavBar from "./NavBar";
import propTypes from "prop-types";
const LayoutWrapper = styled.div``;
export default function Layout({ children }) {
  return (
    <LayoutWrapper>
      <NavBar />
      {children}
    </LayoutWrapper>
  );
}

LayoutWrapper.propTypes = {
  children: propTypes.any,
};
