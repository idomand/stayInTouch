import styled from "styled-components";

export const BasicTextInput = styled.input``;

export const InputSubmit = styled.input`
  cursor: pointer;
  transition: 0.5s;
  &:hover,
  &:focus {
  }

  &::disabled {
    cursor: not-allowed;
  }
`;

export const BasicForm = styled.form``;

export const BasicLabel = styled.label``;
