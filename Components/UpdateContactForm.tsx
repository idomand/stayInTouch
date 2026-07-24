import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { useAuth } from "../lib/AuthContext";
import { updateContact } from "../lib/Firebase";
import { ContactItemType } from "../types/ContactItemType";
import { H5 } from "./Common/StyledText";
import { BasicButton } from "./Common/StyledButton";
import {
  BasicForm,
  BasicInput,
  BasicLabel,
  InputSubmit,
} from "./Common/StyledFormElements";
import DatePickerComponent from "./DatePickerComponent";
import ErrorWarning from "./ErrorWarning";

type UpdateContactFormState = ContactItemType & {
  isModalOpenProp: boolean;
  onClose?: () => void;
};

export default function UpdateContactForm({
  name,
  time,
  timeFromLastTalk,
  contactId,
  notesArray,
  friendEmail,
  isModalOpenProp,
  onClose,
}: UpdateContactFormState) {
  const { currentUser } = useAuth()!;
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenProp);
  const [contactName, setContactName] = useState(name);
  const [newFriendEmail, setNewFriendEmail] = useState(friendEmail);
  const [contactTime, setContactTime] = useState(time);
  const [error, setError] = useState<string | boolean>(false);
  const [lastTalk, setLastTalk] = useState<any>(timeFromLastTalk);

  useEffect(() => {
    setIsModalOpen(isModalOpenProp);
  }, [isModalOpenProp]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  async function updateContactOnSubmit(e: React.FocusEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentUser == null || currentUser.email == null || contactId == null)
      return;

    let timeFromLastTalkVar = lastTalk;

    if (lastTalk instanceof Date) {
      timeFromLastTalkVar = lastTalk.getTime();
    }

    const oldContactData = {
      name,
      time,
      timeFromLastTalk,
      contactId,
      notesArray,
      friendEmail,
    };
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalkVar,
      notesArray: notesArray,
      friendEmail: newFriendEmail,
    };

    let result;

    /* //* if nothing was change ==> just return */
    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time &&
      oldContactData.timeFromLastTalk == newContactData.timeFromLastTalk
    ) {
      return setIsModalOpen(false);
    } else {
      result = await updateContact(
        currentUser.uid,
        currentUser.email,
        contactId,
        oldContactData,
        newContactData,
        "edit",
      );
    }
    if (result === "bad") {
      setError("contact already in list");
      setContactName(name);
    } else {
      setIsModalOpen(false);
    }
  }

  function timeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactTime(+e.target.value);
  }

  function nameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setContactName(e.target.value);

    if (error) {
      setError(false);
    }
  }

  function onCloseModal() {
    setIsModalOpen(false);
    setContactName(name);
    setContactTime(time);
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  return (
    <>
      <ReactModal
        ariaHideApp={false}
        isOpen={isModalOpen}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseModal}
        className={"contact-edit-modal"}
        overlayClassName={"contact-edit-modal-overlay"}
      >
        <MoreOptionsWrapper>
          <EditingSubSection>
            <EditHeader>
              <HeaderName>
                <H5>Editing Contact:</H5>
                <ContactNameHeader>{name}</ContactNameHeader>
              </HeaderName>
              <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
            </EditHeader>
            <EditContactForm onSubmit={updateContactOnSubmit}>
              <NameLabel>
                Change Name:
                <NameInput
                  type="text"
                  placeholder="Enter Name"
                  name="name"
                  value={contactName}
                  required
                  onChange={nameChangeHandler}
                />
              </NameLabel>
              <TimeLabel>
                Change Talk Every X Days:
                <TimeInput
                  type="number"
                  name="time"
                  id="time"
                  max={60}
                  min={1}
                  value={contactTime}
                  onChange={timeChangeHandler}
                />
              </TimeLabel>
              <LastTalkedLabel>
                Change Last Time We Have Spoken
                <DatePickerComponent
                  setStartDate={setLastTalk}
                  startDate={lastTalk}
                />
              </LastTalkedLabel>

              <EmailInputLabel>
                Change Friend Email:
                <EmailInput
                  type="email"
                  value={newFriendEmail}
                  required
                  onChange={(e) => {
                    setNewFriendEmail(e.target.value);
                  }}
                />
              </EmailInputLabel>

              <EditSubmitInput
                disabled={contactName === ""}
                type="submit"
                value="Update"
              />
              {error && <ErrorWarning errorMessage={error} />}
            </EditContactForm>
          </EditingSubSection>
        </MoreOptionsWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//* The styles of the Modal are in the global.css file
//?========================

const CloseModalButton = styled(BasicButton)`
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
const ContactNameHeader = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;
const EditContactForm = styled(BasicForm)`
  display: grid;
  border-radius: 0;
  padding: 15px;
  margin: 10px;
  gap: 30px;
  grid-template-areas:
    "name howMuchTime"
    "lastTalked lastTalked"
    "emailInput emailInput"
    "submit submit"
    "delete delete";

  @media (${({ theme }) => theme.devices.break1}) {
    gap: 5px;
    padding: 10px;
    margin: 0;

    grid-template-areas:
      "name name"
      "howMuchTime howMuchTime"
      "lastTalked lastTalked"
      "emailInput emailInput"
      "submit submit"
      "delete delete";
  }
`;
const EditHeader = styled.div`
  margin-left: 30px;
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (${({ theme }) => theme.devices.break1}) {
    /* margin-top: 10px; */
    margin: 10px 15px;
  }
`;
const EditingSubSection = styled.div``;
const EditSubmitInput = styled(InputSubmit)`
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
const EmailInputLabel = styled(BasicLabel)`
  grid-area: emailInput;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
const EmailInput = styled(BasicInput)`
  grid-area: emailInput;
  border: 1px solid ${({ theme }) => theme.grey2};
`;
const HeaderName = styled.div`
  display: flex;
`;
const LastTalkedLabel = styled.div`
  grid-area: lastTalked;
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: space-between;
`;

const MoreOptionsWrapper = styled.section`
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;

const NameLabel = styled(BasicLabel)`
  grid-area: name;
`;
const NameInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
  padding: 5px;
`;

const TimeLabel = styled(BasicLabel)`
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

const TimeInput = styled(BasicInput)`
  border: 1px solid ${({ theme }) => theme.grey2};
  border-radius: 8px;
`;
