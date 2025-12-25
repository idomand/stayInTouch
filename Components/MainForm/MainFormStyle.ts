import styled from "styled-components";
import { H1 } from "../Common/StyledText";
import { BasicButton } from "../Common/StyledButton";

export const MainFormWrapper = styled.section`
  margin-left: 20px;
  @media (${({ theme }) => theme.devices.break1}) {
    display: flex;
    align-items: center;
    margin: 5px 20px 0;
  }
`;

export const MainHeader = styled(H1)`
  padding-top: 10px;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
export const GameStartText = styled.span<{ $gameStart: boolean }>`
  color: ${({ $gameStart }) => ($gameStart ? "red" : "black")};
  cursor: pointer;
`;

export const MakeAFriend = styled(BasicButton)`
  background-color: ${({ theme }) => theme.green1};
  color: black;
  &:hover,
  &:active {
    background: ${({ theme }) => theme.green3};
    border: 1.3px solid ${({ theme }) => theme.black};
    color: ${({ theme }) => theme.blue1};
  }
`;
