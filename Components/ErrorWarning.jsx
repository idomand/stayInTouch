import React from "react";
import propTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { H5 } from "./Common/StyledText";

const slide = keyframes`
  from {
    transform: translateY(0);
    opacity: 0
  }
  to {
    transform: translateY(40px);
    opacity: 1
  }
`;

const ErrorWrapper = styled.div`
  border: solid ${({ theme }) => theme.red1};
  background-color: ${({ theme }) => theme.red2};
  box-shadow: 0px 4px 28px rgba(0, 0, 0, 0.25);
  border-radius: 13px;
  padding: 15px 20px;
  position: absolute;
  animation: ${slide} 300ms forwards;
`;

const ErrorLogo = styled.img`
  margin-right: 10px;
`;

const ErrorText = styled(H5)`
  color: ${({ theme }) => theme.red1};
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

export default function ErrorWarning({ errorMessage }) {
  return (
    <ErrorWrapper>
      <ErrorText>
        <ErrorLogo src="/Error.svg" />
        {errorMessage}
      </ErrorText>
    </ErrorWrapper>
  );
}

ErrorWarning.propTypes = {
  errorMessage: propTypes.string,
};
