import React from "react";
import styled from "styled-components";
import { H1 } from "./Common/Text";
//*============================================================================================================
//?============================================================================================================

const ErrorWrapper = styled.div`
  border: solid red;
`;

const ErrorText = styled(H1)`
  padding: 5px;
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function ErrorWarning({ errorMessage }) {
  return (
    <ErrorWrapper>
      <ErrorText>{errorMessage}</ErrorText>
    </ErrorWrapper>
  );
}
