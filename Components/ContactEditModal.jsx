import React, { useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import { deleteContact, updateContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";
import { BasicTextInput } from "./Common/Input";
const EditButton = styled(BasicButton)`
  color: ${({ theme }) => theme.black};
  background-color: ${({ theme }) => theme.nicePurple};
  border: solid ${({ theme }) => theme.boldRed};
  width: fill-available;
  margin: 5px 5px;
`;

const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CloseModalButton = styled(BasicButton)`
  font-size: xx-large;
  background-color: ${({ theme }) => theme.boldRed};
  color: ${({ theme }) => theme.black};
  padding: 0;
  height: 40px;
  width: 40px;
`;

const ModalInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UpdateContactForm = styled.form`
  border: solid ${({ theme }) => theme.coolBlue};
  border-radius: 25px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const DeleteContactButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.boldRed};
  margin-top: 15px;
  padding: 10px;
  color: ${({ theme }) => theme.black};
`;

const InputWrapper = styled.div`
  background-color: ${({ theme }) => theme.nicePurple};
  border: 1px dotted ${({ theme }) => theme.boldGreen};
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
const SubmitInput = styled.input`
  background-color: ${({ theme }) => theme.lightGreen};
  margin-top: 5px;
  padding: 10px;
  border-radius: 10px;
`;

export default function ContactEditModal({
  name,
  time,
  timeCreated,
  contactId,
}) {
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState(name);
  const [contactTime, setContactTime] = useState(time);

  function deleteContactFunc() {
    deleteContact(currentUser.uid, currentUser.email, contactId);
    setIsModalOpen(false);
  }

  function updateContactOnSubmit(e) {
    e.preventDefault();
    const newContactData = {
      name: contactName,
      time: contactTime,
      timeCreated: timeCreated,
    };
    updateContact(
      currentUser.uid,
      currentUser.email,
      contactId,
      newContactData
    );
    setIsModalOpen(false);
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
          <h3>Update Contact: {name}</h3>
          <CloseModalButton onClick={() => setIsModalOpen(false)}>
            X
          </CloseModalButton>
        </ModalHeaderWrapper>

        <ModalInputWrapper>
          <UpdateContactForm onSubmit={updateContactOnSubmit}>
            <InputWrapper>
              <label htmlFor="name">Name:</label>
              <BasicTextInput
                id="name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </InputWrapper>
            <InputWrapper>
              <label htmlFor="time">Talk every X days?</label>
              <BasicTextInput
                id="time"
                type="number"
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
              />
            </InputWrapper>
            <SubmitInput type="submit" value="Submit" />
          </UpdateContactForm>

          <DeleteContactButton onClick={deleteContactFunc}>
            Delete contact
          </DeleteContactButton>
        </ModalInputWrapper>
      </ReactModal>
    </>
  );
}

//?========================
//?========================
//* The styles of the Modal are in the global.css file
//?========================
