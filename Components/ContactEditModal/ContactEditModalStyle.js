import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";
import { InputSubmit } from "../Common/StyledFormElements";
import { H2 } from "../Common/StyledText";

export const EditButton = styled(BasicButton)`
  width: fill-available;
`;

export const HeaderText = styled(H2)``;

export const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
export const CloseModalButton = styled(BasicButton)`
  &:hover,
  &:focus {
  }
`;

export const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const UpdateContactForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

export const InputWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;
export const EditSubmitInput = styled(InputSubmit)`
  background-color: ${({ theme }) => theme.blue_1};
  color: ${({ theme }) => theme.white};
  width: 415px;
  height: 45px;
  &:hover,
  &:focus {
    background: rgba(44, 97, 224, 0.1);

    border: 1.3px solid ${({ theme }) => theme.blue_1};
    color: ${({ theme }) => theme.blue_1};
  }
`;
