import styled from "styled-components";

export const BasicTextInput = styled.input`
  background-color: ${({ theme }) => theme.blue2};
  border-radius: 5px;
`;

export const InputSubmit = styled.input`
  cursor: pointer;
  font-weight: bolder;
  transition: 0.5s;
  border-radius: 10px;
  padding: 10px;

  border: solid 2px ${({ theme }) => theme.black};
  background-color: ${({ theme }) => theme.green1};
  color: ${({ theme }) => theme.black};
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.white};
  }

  &::disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;

export const BasicForm = styled.form`
  color: ${({ theme }) => theme.black};
  margin: 10px;
  border: solid 1px;
  padding: 10px;
  border-radius: 10px 10px 0 0;
`;

export const BasicLabel = styled.label``;
