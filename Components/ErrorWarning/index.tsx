import React from "react";
import { ErrorLogo, ErrorText, ErrorWrapper } from "./ErrorWarningStyle";

interface ErrorWarningProps {
  errorMessage: string | boolean;
}

export default function ErrorWarning({ errorMessage }: ErrorWarningProps) {
  return (
    <ErrorWrapper>
      <ErrorText>
        <ErrorLogo src="/Error.svg" />
        {errorMessage}
      </ErrorText>
    </ErrorWrapper>
  );
}
