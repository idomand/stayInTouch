// import { useMedia } from "react-use";
import { BsExclamationSquare } from "react-icons/bs";
import { IoCheckboxOutline } from "react-icons/io5";
import styled, { useTheme } from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { oneDay } from "../lib/ConstantsFile";
import { updateContact } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import Notes from "./Notes";

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
      <DateValue $statusColor={isTalkingStatusOK}>Talked today</DateValue>
    );
  } else {
    lastTalkedToResponse = (
      <DateValue $statusColor={isTalkingStatusOK}>
        Didn’t talk for{" "}
        {Math.floor((currantTime - timeFromLastTalk) / oneDay)} days
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
      "reset",
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
          <DateWrapper>{lastTalkedToResponse}</DateWrapper>
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
            <ClickableCheckbox
              onClick={resetFunction}
              $baseColor={Theme.green1}
              size={50}
            />
          ) : (
            <ClickableExclamation
              onClick={resetFunction}
              $baseColor={Theme.red1}
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

const ContactItemContainer = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: 75vw; */
  list-style-type: none;
  margin: 10px 5px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 85vw;
  }
`;
const ContactItemWrapper = styled.div`
  display: grid;
  flex-grow: 1;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.white};
  border-radius: 15px;
  padding: 10px;
  grid-template-areas: "contactDetails contactDates notes buttons";

  @media (${({ theme }) => theme.devices.break1}) {
    grid-template-areas:
      "contactDetails  notes "
      "contactDates  buttons ";
  }
`;

const NotesButtonWrapper = styled.div`
  grid-area: notes;
  display: flex;
  justify-content: end;
  align-items: center;
  margin-right: 20px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 0;
  }
`;

const ContactDetailsWrapper = styled.div`
  grid-area: contactDetails;
  display: flex;
  width: 200px;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;
const ContactDetailsSubDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const NameContainer = styled.span`
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.header4};
  line-height: 21px;
  text-transform: capitalize;
  width: max-content;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 160px;
    text-align: center;
    margin-bottom: 0px;
  }
`;

const ContactDatesWrapper = styled.div`
  grid-area: contactDates;
  display: flex;
  width: 400px;

  @media (${({ theme }) => theme.devices.break1}) {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 15px;
    margin-top: 15px;
    margin-bottom: 20px;
    max-width: 200px;
  }
`;
const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 15px;
`;

interface DateValueProps {
  readonly $statusColor: boolean;
}

const DateValue = styled.span<DateValueProps>`
  color: ${({ theme, $statusColor }) => {
    if (!$statusColor) {
      return theme.red1;
    } else {
      return theme.grey3;
    }
  }};

  font-weight: 600;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  line-height: 20px;
  text-align: center;
  margin: 0;
`;

const ButtonsWrapper = styled.div`
  grid-area: buttons;
  display: flex;
  align-items: center;
  justify-content: end;
  &:hover,
  &:focus {
  }
`;

type IconProps = {
  $baseColor: string;
};

const ClickableCheckbox = styled(IoCheckboxOutline)<IconProps>`
  cursor: pointer;
  color: ${({ $baseColor }) => $baseColor};
  &:hover {
    color: ${({ theme }) => theme.blue1};
  }
`;

const ClickableExclamation = styled(BsExclamationSquare)<IconProps>`
  cursor: pointer;
  color: ${({ $baseColor }) => $baseColor};
  &:hover {
    color: ${({ theme }) => theme.blue1};
  }
`;
