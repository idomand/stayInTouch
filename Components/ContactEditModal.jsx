import React, { useState } from "react";
import styled from "styled-components";
import ReactModal from "react-modal";
import propTypes from "prop-types";

import { updateContactFull, updateContactTime } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import { BasicInput, BasicLabel } from "./Common/StyledFormElements";
import ErrorWarning from "./ErrorWarning";
import { BasicButton } from "./Common/StyledButton";
import { InputSubmit } from "./Common/StyledFormElements";
import { H2 } from "./Common/StyledText";

const EditButton = styled.button`
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  border: none;
  background-color: transparent;
  padding: 0;
  border-bottom: solid;
  margin-bottom: 5px;
  transition: 0.3s all;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.blue2};
  }
`;

// 1
const HeaderText = styled(H2)``;

const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
const CloseModalButton = styled(BasicButton)`
  &:hover,
  &:focus {
  }
`;

const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UpdateContactForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
  }
`;
const EditSubmitInput = styled(InputSubmit)`
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
`;

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
      <EditButton onClick={() => setIsModalOpen(true)}>More Options</EditButton>
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
              <BasicLabel htmlFor="name">Name:</BasicLabel>
              <BasicInput
                id="name"
                type="text"
                value={contactName}
                onChange={nameChangeHandler}
              />
            </InputWrapper>
            <InputWrapper>
              <BasicLabel htmlFor="time">Talk every X days?</BasicLabel>
              <BasicInput
                id="time"
                type="number"
                max={31}
                min={1}
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
              />
            </InputWrapper>
            <EditSubmitInput
              disabled={contactName === ""}
              type="submit"
              value="Update Contact"
            />
          </UpdateContactForm>
          {error && <ErrorWarning errorMessage={error} />}
        </ModalInputWrapper>
      </ReactModal>
    </>
  );

  // return (
  //   <>
  //     <EditButton onClick={() => setIsModalOpen(true)}>More Options</EditButton>
  //     <ReactModal
  //       ariaHideApp={false}
  //       isOpen={isModalOpen}
  //       shouldFocusAfterRender={true}
  //       className={"contact-edit-modal"}
  //       overlayClassName={"contact-edit-modal-overlay"}
  //     >
  //       <ModalHeaderWrapper>
  //         <HeaderText>Update Contact: {name}</HeaderText>
  //         <CloseModalButton onClick={onCloseModal}>X</CloseModalButton>
  //       </ModalHeaderWrapper>

  //       <ModalInputWrapper>
  //         <UpdateContactForm onSubmit={updateContactOnSubmit}>
  //           <InputWrapper>
  //             <BasicLabel htmlFor="name">Name:</BasicLabel>
  //             <BasicTextInput
  //               id="name"
  //               type="text"
  //               value={contactName}
  //               onChange={nameChangeHandler}
  //             />
  //           </InputWrapper>
  //           <InputWrapper>
  //             <BasicLabel htmlFor="time">Talk every X days?</BasicLabel>
  //             <BasicTextInput
  //               id="time"
  //               type="number"
  //               max={31}
  //               min={1}
  //               value={contactTime}
  //               onChange={(e) => setContactTime(e.target.value)}
  //             />
  //           </InputWrapper>
  //           <EditSubmitInput
  //             disabled={contactName === ""}
  //             type="submit"
  //             value="Update Contact"
  //           />
  //         </UpdateContactForm>
  //         {error && <ErrorWarning errorMessage={error} />}
  //       </ModalInputWrapper>
  //     </ReactModal>
  //   </>
  // );
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
