import React from "react";
import { ErrorLogo, ErrorText, ErrorWrapper } from "./ErrorWarningStyle";

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
