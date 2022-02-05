import React, { useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import { updateContactFull, updateContactTime } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import { BasicTextInput, InputSubmit } from "./Common/Input";
import propTypes from "prop-types";
import { H2 } from "./Common/Text";
import ErrorWarning from "./ErrorWarning";
//*============================================================================================================
//?============================================================================================================

const EditButton = styled(BasicButton)`
  color: ${({ theme }) => theme.black};
  background-color: ${({ theme }) => theme.blue2};
  border: solid ${({ theme }) => theme.black} 2px;
  width: fill-available;
  margin: 5px 5px;
`;

const HeaderText = styled(H2)`
  padding: 5px;
  border-bottom: solid;
  margin: 0 auto 15px auto;
`;

const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
const CloseModalButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue4};
  color: ${({ theme }) => theme.white};
  font-size: xx-large;
  padding: 0;
  height: 40px;
  width: 40px;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
    color: ${({ theme }) => theme.black};

    border: solid 1px ${({ theme }) => theme.black};
  }
`;

const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UpdateContactForm = styled.form`
  border: solid ${({ theme }) => theme.coolBlue};
  background-color: ${({ theme }) => theme.blue1};
  border-radius: 25px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 40vh;
`;

const InputWrapper = styled.div`
  background-color: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.black};
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  margin: 5px;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;
const EditSubmitInput = styled(InputSubmit)`
  margin-top: 5px;
`;
// const ErrorWrapper = styled.div`
//   border: solid red;
// `;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

export default function ContactEditModal({
  name,
  time,
  timeFromLastTalk,
  contactId,
}) {
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);
  const [error, setError] = useState(false);

  async function updateContactOnSubmit(e) {
    e.preventDefault();
    const newContactData = {
      name: contactName,
      time: +contactTime,
      timeFromLastTalk: timeFromLastTalk,
    };
    const oldContactData = { name, time, timeFromLastTalk };

    let result;

    if (
      oldContactData.name == newContactData.name &&
      oldContactData.time == newContactData.time
    ) {
      return setIsModalOpen(false);
    } else if (oldContactData.name == newContactData.name) {
      result = await updateContactTime(
        currentUser.uid,
        currentUser.email,
        contactId,
        newContactData
      );
    } else {
      result = await updateContactFull(
        currentUser.uid,
        currentUser.email,
        contactId,
        newContactData
      );
    }

    if (result === "bad") {
      setError("contact already in list");
    } else {
      setIsModalOpen(false);
    }
  }

  function nameChangeHandler(e) {
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
  }

  return (
    <>
      <EditButton onClick={() => setIsModalOpen(true)}>Edit</EditButton>
      <ReactModal
        ariaHideApp={false}
        isOpen={isModalOpen}
        shouldFocusAfterRender={true}
        className={"contact-edit-modal"}
        overlayClassName={"contact-edit-modal-overlay"}
      >
        <ModalHeaderWrapper>
          <HeaderText>Update Contact: {name}</HeaderText>
          <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
        </ModalHeaderWrapper>

        <ModalInputWrapper>
          <UpdateContactForm onSubmit={updateContactOnSubmit}>
            <InputWrapper>
              <label htmlFor="name">Name:</label>
              <BasicTextInput
                id="name"
                type="text"
                value={contactName}
                onChange={nameChangeHandler}
              />
            </InputWrapper>
            <InputWrapper>
              <label htmlFor="time">Talk every X days?</label>
              <BasicTextInput
                id="time"
                type="number"
                max={31}
                min={1}
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
              />
            </InputWrapper>
            <EditSubmitInput type="submit" value="Submit" />
          </UpdateContactForm>
          {error && <ErrorWarning errorMessage={error} />}
        </ModalInputWrapper>
      </ReactModal>
    </>
  );
}

ContactEditModal.propTypes = {
  name: propTypes.string,
  time: propTypes.number,
  timeFromLastTalk: propTypes.number,
  contactId: propTypes.string,
};

//?========================
//?========================
//* The styles of the Modal are in the global.css file
//?========================
