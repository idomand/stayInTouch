import React,{useState} from "react";
import { useAuth } from "../../lib/AuthContext";
import AddNewContact from "../AddNewContact";
import HowToUse from "../HowToUse";
import { HeaderWrapper, MainFormWrapper, MainHeader,GameStartText } from "./MainFormStyle";

export default function MainForm() {
  const { currentUser } = useAuth()!;
const [hiddenGameIndicator,setHiddenGameIndicator] = useState(false)

function startGame() {
  setHiddenGameIndicator(value=>!value)
}

  return (
    <>
      <MainFormWrapper>
        <HeaderWrapper>
          <MainHeader> <GameStartText $gameStart={hiddenGameIndicator}  onClick={startGame} >Hi</GameStartText> {currentUser?.displayName}</MainHeader>
          <HowToUse />
        </HeaderWrapper>
        <AddNewContact />
      </MainFormWrapper>
    </>
  );
}
