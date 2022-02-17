import React from "react";
import propTypes from "prop-types";

import styled from "styled-components";
import { H1 } from "./Common/StyledText";

const ErrorWrapper = styled.div``;

const ErrorText = styled(H1)``;

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
