import { BasicButton, MinimalButton } from "../Common/StyledButton";
import {
  BasicForm,
  BasicInput,
  BasicLabel,
  InputSubmit,
} from "../Common/StyledFormElements";
import { H5, P1 } from "../Common/StyledText";
import styled from "styled-components";

export const MoreOptionsButton = styled(MinimalButton)``;

export const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;

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

export const EditingSubSection = styled.div``;

export const EditHeader = styled.div`
  margin-left: 30px;
  margin-top: 25px;
  display: flex;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-content: space-between;
    /* margin-top: 10px; */
    margin: 10px 15px;
  }
`;

export const HeaderName = styled.div`
  display: flex;
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
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  grid-template-areas:
    "name howMuchTime"
    "lastTalked lastTalked"
    "submit submit";

  @media (${({ theme }) => theme.devices.break1}) {
    border-right: none;
    gap: 5px;
    padding: 10px;
    margin: 0;

    grid-template-areas:
      "name name"
      "howMuchTime howMuchTime"
      "lastTalked lastTalked"
      "submit submit";
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

export const LastTalkedLabel = styled.div`
  grid-area: lastTalked;
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
`;
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

export const CalendarSubSection = styled.div`
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 0;
  }
`;

export const CalendarHeader = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (${({ theme }) => theme.devices.break1}) {
    margin: 10px 15px;
  }
`;

export const SpecificTimeWrapper = styled(BasicForm)`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
    align-items: flex-start;
    margin-top: 0;
  }
`;
export const CalenderText = styled(P1)`
  margin-bottom: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-left: 15px;
    text-align: start;
  }
`;

export const CalenderDatePickerWrapper = styled.div`
  @media (${({ theme }) => theme.devices.break1}) {
    margin: auto;
  }
`;

export const SaveToGoogleCalender = styled(BasicButton)`
  width: 100%;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.blue3};
  border: 1.3px solid ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.blue1};
  margin-top: 23px;
  &:hover,
  &:focus {
    border: 1.3px solid ${({ theme }) => theme.green1};
    color: ${({ theme }) => theme.green1};
    background: ${({ theme }) => theme.green3};
  }

  @media (${({ theme }) => theme.devices.break1}) {
    margin: 10px 0;
    max-width: fit-content;
    width: auto;
    align-self: center;
  }
`;

export const CalenderLogo = styled.img`
  justify-self: flex-start;
`;
