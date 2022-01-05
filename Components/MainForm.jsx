import React from "react";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import { H1 } from "./Common/Text";
const MainFormWrapper = styled.section`
  margin-top: 50px;
`;

const MainFormContent = styled.div`
  color: ${({ theme }) => theme.primaryColorText};
`;

export default function MainForm() {
  return (
    <MainFormWrapper>
      <H1>this is the main form</H1>
      <BasicButton>123</BasicButton>
    </MainFormWrapper>
  );
}
