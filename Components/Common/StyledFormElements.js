import styled from "styled-components";

export const BasicTextInput = styled.input``;

export const InputSubmit = styled.input`
  cursor: pointer;
  transition: all 0.5s;
  color: ${({ theme }) => theme.white};
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  border-radius: 8px;
  border: 1.3px solid ${({ theme }) => theme.white};

  &:disabled {
    cursor: not-allowed;
    background: grey;
    :hover,
    :focus {
      cursor: not-allowed;
      background: grey;
      color: ${({ theme }) => theme.white};
      border: 1.3px solid ${({ theme }) => theme.white};
    }
  }
`;

export const BasicForm = styled.form``;

export const BasicLabel = styled.label``;
