import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";

export const ContactItemWrapper = styled.li`
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  @media (${({ theme }) => theme.devices.break2}) {
  }
`;

export const ButtonContainer = styled.div`
  width: min-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  justify-content: space-around;
`;

export const ResetButton = styled(BasicButton)``;

export const DataWrapper = styled.div`
  display: grid;
  justify-content: space-around;
  grid-template-areas: "name howLong lastSpoke status";
  align-items: center;
  gap: 10px;
  border-left: 1.5px ${({ theme }) => theme.black} solid;
  flex-grow: 1;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-items: center;
    gap: 3px;
    padding: 10px;

    grid-template-areas:
      "name  status"
      "howLong lastSpoke";
  }
`;

export const NameContainer = styled.span`
  grid-area: name;
  @media (${({ theme }) => theme.devices.break1}) {
    overflow: scroll;
  }
`;
export const TimeContainer = styled.div`
  grid-area: howLong;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const LastTalkedContainer = styled.div`
  grid-area: lastSpoke;
`;

export const StatusContainer = styled.div`
  grid-area: status;
  display: flex;
  align-items: center;
`;

export const StatusPicture = styled.img`
  height: 30px;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const DeleteButton = styled(BasicButton)`
  &:hover,
  &:focus {
  }
`;

export const DeleteLogo = styled.img`
  height: 20px;
`;
