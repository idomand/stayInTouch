import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AddNewContact from "../AddNewContact";
import { showArt } from "../SecretGame";
import {
  GameStartText,
  HeaderWrapper,
  MainFormWrapper,
  MainHeader,
  MakeAFriend,
} from "./MainFormStyle";
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
