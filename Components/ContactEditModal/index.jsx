import React, { useState } from "react";
import ReactModal from "react-modal";
import { updateContactFull, updateContactTime } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import { BasicTextInput, BasicLabel } from "../Common/StyledFormElements";
import propTypes from "prop-types";
import ErrorWarning from "../ErrorWarning";
import {
  CloseModalButton,
  EditButton,
  EditSubmitInput,
  HeaderText,
  InputWrapper,
  ModalHeaderWrapper,
  ModalInputWrapper,
  UpdateContactForm,
} from "./ContactEditModalStyle";

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
              <BasicLabel htmlFor="name">Name:</BasicLabel>
              <BasicTextInput
                id="name"
                type="text"
                value={contactName}
                onChange={nameChangeHandler}
              />
            </InputWrapper>
            <InputWrapper>
              <BasicLabel htmlFor="time">Talk every X days?</BasicLabel>
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
