import React, { useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import { BasicButton } from "./Common/Button";
import { deleteContact, updateContact } from "../lib/Firebase";
import { useAuth } from "../lib/AuthContext";

const EditButton = styled(BasicButton)``;

const CloseModalButton = styled(BasicButton)``;

const ModalHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ModalInputWrapper = styled.div``;

const UpdateContactForm = styled.form``;

const DeleteContactButton = styled.button`
  background-color: ${({ theme }) => theme.secondaryColor};
`;

export default function ContactEditModal({
  name,
  time,
  timeCreated,
  contactId,
}) {
  const { currentUser } = useAuth();
  console.log("contactId :>> ", contactId);

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
    console.log("newContactData :>> ", newContactData);
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
          <h3>Edit Contact</h3>
          <CloseModalButton onClick={() => setIsModalOpen(false)}>
            X
          </CloseModalButton>
        </ModalHeaderWrapper>

        <ModalInputWrapper>
          <UpdateContactForm onSubmit={updateContactOnSubmit}>
            <label>
              Name:
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>
            <label>
              Talk every X days?
              <input
                type="number"
                value={contactTime}
                onChange={(e) => setContactTime(e.target.value)}
              />
            </label>
            <input type="submit" value="Submit" />
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

// import React, { useState, useContext } from "react";
// import ReactModal from "react-modal";
// import styled from "styled-components";
// import { BasicButton } from "./Common/Button";
// import DataContext from "../lib/DataContext";
// import { deleteContact } from "../lib/Firebase";
// import { useAuth } from "../lib/AuthContext";

// const EditButton = styled(BasicButton)``;

// const CloseModalButton = styled(BasicButton)``;

// const ModalHeaderWrapper = styled.div`
//   display: flex;
//   justify-content: space-between;
// `;
// const ModalInputWrapper = styled.div``;

// const EditNameForm = styled.form`
//   display: flex;
// `;

// const EditTimeForm = styled.form`
//   display: flex;
// `;

// const DeleteContactButton = styled.button`
//   background-color: ${({ theme }) => theme.secondaryColor};
// `;

// export default function ContactEditModal({
//   name,
//   time,
//   timeCreated,
//   contactId,
// }) {
//   const { currentUser } = useAuth();
//   console.log("contactId :>> ", contactId);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [contactName, setContactName] = useState(name);
//   const [contactTime, setContactTime] = useState(time);
//   const contactData = useContext(DataContext);

//   function deleteContactFunc() {
//     deleteContact(currentUser.uid, currentUser.email, contactId);
//     setIsModalOpen(false);
//   }

//   function editContactName(e) {
//     e.preventDefault();
//     contactData.editContactName(contactId, contactName);
//     setIsModalOpen(false);
//   }

//   function editContactTime(e) {
//     e.preventDefault();
//     contactData.editContactTime(contactId, contactTime);
//     setIsModalOpen(false);
//   }

//   return (
//     <>
//       <EditButton onClick={() => setIsModalOpen(true)}>Edit</EditButton>
//       <ReactModal
//         ariaHideApp={false}
//         isOpen={isModalOpen}
//         shouldFocusAfterRender={true}
//         className={"contact-edit-modal"}
//         overlayClassName={"contact-edit-modal-overlay"}
//       >
//         <ModalHeaderWrapper>
//           <h3>Edit Contact</h3>
//           <CloseModalButton onClick={() => setIsModalOpen(false)}>
//             X
//           </CloseModalButton>
//         </ModalHeaderWrapper>

//         <ModalInputWrapper>
//           <EditNameForm onSubmit={editContactName}>
//             <label>
//               Name:
//               <input
//                 type="text"
//                 value={contactName}
//                 onChange={(e) => setContactName(e.target.value)}
//               />
//             </label>
//             <input type="submit" value="Submit" />
//           </EditNameForm>
//           <EditTimeForm onSubmit={editContactTime}>
//             <label>
//               Talk every X days?
//               <input
//                 type="number"
//                 value={contactTime}
//                 onChange={(e) => setContactTime(e.target.value)}
//               />
//             </label>
//             <input type="submit" value="Submit" />
//           </EditTimeForm>
//           <DeleteContactButton onClick={deleteContactFunc}>
//             Delete contact
//           </DeleteContactButton>
//         </ModalInputWrapper>
//       </ReactModal>
//     </>
//   );
// }

// //?========================
// //?========================
// //* The styles of the Modal are in the global.css file
// //?========================
