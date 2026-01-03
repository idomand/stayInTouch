import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";
import {
  BasicForm,
  BasicInput,
  BasicLabel,
  InputSubmit,
} from "../Common/StyledFormElements";
import { H5 } from "../Common/StyledText";
export const CloseModalButton = styled(BasicButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.black};
  border: none;
  font-size: ${({ theme }) => theme.typeScale.header3};
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue3};
    border: none;
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
    /* margin: auto; */
  }
`;
export const ContactNameHeader = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;
export const EditContactForm = styled(BasicForm)`
  display: grid;
  border-radius: 0;
  padding: 15px;
  margin: 10px;
  gap: 30px;
  grid-template-areas:
    "name howMuchTime"
    "lastTalked lastTalked"
    "emailInput emailInput"
    "submit submit"
    "delete delete";

  @media (${({ theme }) => theme.devices.break1}) {
    gap: 5px;
    padding: 10px;
    margin: 0;

    grid-template-areas:
      "name name"
      "howMuchTime howMuchTime"
      "lastTalked lastTalked"
      "emailInput emailInput"
      "submit submit"
      "delete delete";
  }
`;
export const EditHeader = styled.div`
  margin-left: 30px;
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (${({ theme }) => theme.devices.break1}) {
    /* margin-top: 10px; */
    margin: 10px 15px;
  }
`;
export const EditingSubSection = styled.div``;
export const EditSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  width: 415px;
  height: 45px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;
export const EmailInputLabel = styled(BasicLabel)`
  grid-area: emailInput;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
export const EmailInput = styled(BasicInput)`
  grid-area: emailInput;
  border: 1px solid ${({ theme }) => theme.grey2};
`;
export const HeaderName = styled.div`
  display: flex;
`;
export const LastTalkedLabel = styled.div`
  grid-area: lastTalked;
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
`;

export const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;

export const NameLabel = styled(BasicLabel)`
  grid-area: name;
`;
export const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
  padding: 5px;
`;

export const TimeLabel = styled(BasicLabel)`
  grid-area: howMuchTime;
  position: relative;
  &::after {
    content: "Days" attr(data-domain);
    font-weight: bold;
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: ${({ theme }) => theme.grey3};
  }
`;

export const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
  border-radius: 8px;
`;
