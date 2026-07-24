import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { showArt } from "./SecretGame";
import { BasicButton } from "./Common/StyledButton";
import { H1 } from "./Common/StyledText";

export default function MainForm() {
  const { currentUser } = useAuth()!;
  const [hiddenGameIndicator, setHiddenGameIndicator] = useState(false);
  const [showMainForm, setShowMainForm] = useState(false);

  function startGame() {
    setHiddenGameIndicator((value) => !value);
    showArt();
  }

  return (
    <>
      <MainFormWrapper>
        <HeaderWrapper>
          <MainHeader>
            {" "}
            <GameStartText $gameStart={hiddenGameIndicator} onClick={startGame}>
              Hi
            </GameStartText>{" "}
            {currentUser?.displayName}
          </MainHeader>
        </HeaderWrapper>
        <div>
          <MakeAFriend onClick={() => setShowMainForm(!showMainForm)}>
            Make a friend
          </MakeAFriend>
        </div>
      </MainFormWrapper>
      {showMainForm && <AddNewContact />}
    </>
  );
}

const MainFormWrapper = styled.section`
  margin-left: 20px;
  @media (${({ theme }) => theme.devices.break1}) {
    display: flex;
    align-items: center;
    margin: 5px 20px 0;
  }
`;

const MainHeader = styled(H1)`
  padding-top: 10px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const GameStartText = styled.span<{ $gameStart: boolean }>`
  color: ${({ $gameStart }) => ($gameStart ? "red" : "black")};
  cursor: pointer;
`;

const MakeAFriend = styled(BasicButton)`
  background-color: ${({ theme }) => theme.green1};
  color: black;
  &:hover,
  &:active {
    background: ${({ theme }) => theme.green3};
    border: 1.3px solid ${({ theme }) => theme.black};
    color: ${({ theme }) => theme.blue1};
  }
`;
