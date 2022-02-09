import React from "react";
import styled from "styled-components";
import { H1 } from "./Common/StyledText";
import propTypes from "prop-types";

const ErrorWrapper = styled.div`
  color: ${({ theme }) => theme.red1};
  background-color: ${({ theme }) => theme.red2};
  margin: 15px;
  /* border: solid 2px ${({ theme }) => theme.black}; */
  border-radius: 15px;
`;

const ErrorText = styled(H1)`
  padding: 10px;
  color: ${({ theme }) => theme.red1};
`;

export default function ErrorWarning({ errorMessage }) {
  return (
    <ErrorWrapper>
      <ErrorText> ⛔ {errorMessage}</ErrorText>
    </ErrorWrapper>
  );
}

ErrorWarning.propTypes = {
  errorMessage: propTypes.string,
};
