import React from "react";
import styled from "styled-components";
import NavBar from "./NavBar";

const LayoutWrapper = styled.div``;
export default function Layout({ children }) {
  return (
    <LayoutWrapper>
      <NavBar />
      {children}
    </LayoutWrapper>
  );
}
