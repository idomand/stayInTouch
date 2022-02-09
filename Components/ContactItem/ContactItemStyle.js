import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";

export const ContactItemWrapper = styled.li`
  display: flex;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.black};
  list-style-type: none;
  margin: 10px 5px;
  border-radius: 10px;
  box-shadow: 4px 5px 12px 3px ${({ theme }) => theme.blue1};
  @media (${({ theme }) => theme.devices.break2}) {
    width: 80%;
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

export const ResetButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue2};
  border: solid 2px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  margin: 5px 5px;
`;

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
  border: 2px ${({ theme }) => theme.black} dotted;
  border-radius: 10px;
  padding: 10px;
  font-weight: bold;
  min-width: 110px;
  text-decoration: underline;
  @media (${({ theme }) => theme.devices.break1}) {
    overflow: scroll;
    padding: 5px;
    max-width: 110px;
  }
`;
export const TimeContainer = styled.div`
  width: 150px;
  grid-area: howLong;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 110px;
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
  border-radius: 50%;
  margin-left: 10px;
  height: 110px;
  width: 110px;

  @media (${({ theme }) => theme.devices.break1}) {
    width: 70px;
    height: 70px;
  }
`;

export const DeleteButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue2};
  border: 2px solid ${({ theme }) => theme.black};
  margin: 5px 0;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
  }
`;

export const DeleteLogo = styled.img`
  height: 20px;
`;
