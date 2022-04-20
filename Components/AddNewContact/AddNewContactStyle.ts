import styled from "styled-components";
import { BasicForm, BasicLabel } from "../Common/StyledFormElements";
import { BasicInput, InputSubmit } from "../Common/StyledFormElements";

export const AddContactForm = styled(BasicForm)`
  display: grid;
  padding: 15px;
  gap: 5px;
  width: auto;
  grid-template-areas:
    "name howMuchTime howMuchTime"
    "lastTalked notes notes"
    "submit submit submit";

  @media (${({ theme }) => theme.devices.break1}) {
    padding: 10px 5px;
    width: 85vw;
    gap: 0;
    grid-template-areas:
      "name howMuchTime"
      "lastTalked lastTalked"
      "notes notes"
      "submit submit";
  }
`;

export const NameLabel = styled(BasicLabel)`
  grid-area: name;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
export const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
`;

export const TimeLabel = styled(BasicLabel)`
  grid-area: howMuchTime;
  position: relative;
  &:after {
    content: "Days" attr(data-domain);
    position: absolute;
    top: 33px;
    left: 20px;
    font-size: 10px;
    color: ${({ theme }) => theme.grey3};
    font-weight: bold;
  }

  @media (${({ theme }) => theme.devices.break1}) {
    &::after {
      /* top: 50px; */
    }
  }
`;

export const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
  border-radius: 8px;
`;

export const LastTalkedLabel = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
  grid-area: lastTalked;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const NotesLabel = styled(BasicLabel)`
  grid-area: notes;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const NotesInput = styled.textarea`
  border: 1px solid ${({ theme }) => theme.grey2};
  border-radius: 8px;
  height: 30px;
  background-color: ${({ theme }) => theme.grey1};
  &:focus {
    border: 1px solid ${({ theme }) => theme.blue1};
  }
`;

export const AddSubmitInput = styled(InputSubmit)`
  grid-area: submit;
  background-color: ${({ theme }) => theme.green1};
  color: ${({ theme }) => theme.white};
  transition: all 0.5s;
  height: 40px;
  margin: 0px 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.green3};

    border: 1.3px solid ${({ theme }) => theme.green1};
    color: ${({ theme }) => theme.green1};
  }
`;
