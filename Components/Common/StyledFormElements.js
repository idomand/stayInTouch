import styled from "styled-components";

export const InputSubmit = styled.input`
  cursor: pointer;
  transition: all 0.5s;
  color: ${({ theme }) => theme.white};
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  border-radius: 8px;
  border: 1.3px solid ${({ theme }) => theme.white};
  text-align: center;

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
  background-color: ${({ theme }) => theme.white};
  border-radius: 10px;
`;
export const BasicInput = styled.input`
  cursor: pointer;
  background-color: Lightgrey;

  font-size: ${({ theme }) => theme.p_normal};

  height: 30px;
  border-radius: 10px;
  border: none;
  margin-top: 5px;
`;

export const BasicLabel = styled.label`
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
  /* background-color: greenyellow; */
`;
