import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";
import { InputSubmit } from "../Common/StyledFormElements";
import { H2 } from "../Common/StyledText";

export const EditButton = styled(BasicButton)`
  color: ${({ theme }) => theme.black};
  background-color: ${({ theme }) => theme.blue2};
  border: solid ${({ theme }) => theme.black} 2px;
  width: fill-available;
  margin: 5px 5px;
`;

export const HeaderText = styled(H2)`
  padding: 5px;
  border-bottom: solid;
  margin: 0 auto 15px auto;
`;

export const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
export const CloseModalButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue4};
  color: ${({ theme }) => theme.white};
  font-size: xx-large;
  padding: 0;
  height: 40px;
  width: 40px;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
    color: ${({ theme }) => theme.black};

    border: solid 1px ${({ theme }) => theme.black};
  }
`;

export const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const UpdateContactForm = styled.form`
  border: solid ${({ theme }) => theme.coolBlue};
  background-color: ${({ theme }) => theme.blue1};
  border-radius: 25px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 40vh;
`;

export const InputWrapper = styled.div`
  background-color: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.black};
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  margin: 5px;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;
export const EditSubmitInput = styled(InputSubmit)`
  margin-top: 5px;
`;
