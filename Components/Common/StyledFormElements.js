import styled from "styled-components";

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

export const BasicForm = styled.form`
  border: solid red;
  background-color: ${({ theme }) => theme.white};
  border-radius: 10px;
`;
export const BasicInput = styled.input`
  background-color: ${({ theme }) => theme.grey};
  border-radius: 10px;
  border: none;
`;

export const BasicLabel = styled.label`
  /* background-color: greenyellow; */
`;
