import React from "react";
import propTypes from "prop-types";
import { ErrorText, ErrorWrapper } from "./ErrorWarningStyle";

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
