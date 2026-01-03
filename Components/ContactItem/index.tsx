import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
// import { useMedia } from "react-use";
import { useTheme } from "styled-components";
import { useAuth } from "../../lib/AuthContext";
import { oneDay } from "../../lib/ConstantsFile";
import { updateContact } from "../../lib/Firebase";
import { ContactItemType } from "../../types/ContactItemType";
import MoreOptionsDropdown from "../MoreOptionsDropdown";
import Notes from "../Notes";
import {
  ButtonsWrapper,
  ContactDatesWrapper,
  ContactDetailsSubDiv,
  ContactDetailsWrapper,
  ContactItemContainer,
  ContactItemWrapper,
  DateValue,
  DateWrapper,
  NameContainer,
  NotesButtonWrapper,
} from "./ContactItemStyle";

export default function ContactItem({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
}: ContactItemType) {
  // const [showSafeCloseDialog, setShowSafeCloseDialog] = useState(false);

  const { currentUser } = useAuth()!;
  const currantTime = new Date().getTime();
  const Theme = useTheme();
  // const isMobile = useMedia(`(${Theme.devices.break1})`);

  let nextTalkResponse;

  let lastTalkedToResponse;
  let isTalkingStatusOK;

  if (currantTime - timeFromLastTalk < time * oneDay) {
    isTalkingStatusOK = true;
  } else {
    isTalkingStatusOK = false;
  }

  if (currantTime - timeFromLastTalk < 86000000) {
    lastTalkedToResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>Today!</DateValue>
    );
  } else {
    lastTalkedToResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)}
      </DateValue>
    );
  }

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  if (nextTalkInDays > 0) {
    nextTalkResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>
        Talk in {nextTalkInDays} days
      </DateValue>
    );
  } else {
    nextTalkResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>Talk Today!</DateValue>
    );
  }

  // function addToGoogle() {
  //   console.log("addToGoogle");
  // }

  function resetFunction() {
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    const oldContactData = {
      name: name,
      time: time,
      timeFromLastTalk: timeFromLastTalk,
      notesArray: notesArray,
      friendEmail: friendEmail,
    };
    const newContactData = {
      name: name,
      time: time,
      timeFromLastTalk: currantTime,
      notesArray: notesArray,
      friendEmail: friendEmail,
    };
    updateContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      oldContactData,
      newContactData,
      "reset"
    );
  }

  return (
    <ContactItemContainer>
      <ContactItemWrapper>
        <ContactDetailsWrapper>
          <ContactDetailsSubDiv>
            <NameContainer>{name}</NameContainer>
          </ContactDetailsSubDiv>
        </ContactDetailsWrapper>
        <ContactDatesWrapper>
          <DateWrapper>
            <DateValue $statusColor={isTalkingStatusOK}>
              Didn’t talk for {lastTalkedToResponse} days
            </DateValue>
          </DateWrapper>
          <DateWrapper>{nextTalkResponse}</DateWrapper>
        </ContactDatesWrapper>
        {/* <MoreOptionsWrapper>
          <MoreOptions
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </MoreOptionsWrapper> */}
        <NotesButtonWrapper>
          <Notes
            friendEmail={friendEmail}
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />
        </NotesButtonWrapper>
        <ButtonsWrapper>
          {isTalkingStatusOK ? (
            <IoCheckboxOutline
              onClick={resetFunction}
              color={Theme.green1}
              size={50}
            />
          ) : (
            <BsExclamationSquare
              onClick={resetFunction}
              color={Theme.red1}
              size={50}
            />
          )}

          <MoreOptionsDropdown
            friendEmail={friendEmail}
            name={name}
            time={time}
            timeFromLastTalk={timeFromLastTalk}
            contactId={contactId}
            notesArray={notesArray}
          />

          {/* <AddToGoogle onClick={addToGoogle}>Book</AddToGoogle> */}
        </ButtonsWrapper>
      </ContactItemWrapper>
    </ContactItemContainer>
  );
}
