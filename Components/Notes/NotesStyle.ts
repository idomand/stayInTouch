import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";
import { BasicForm, InputSubmit } from "../Common/StyledFormElements";
import { H5 } from "../Common/StyledText";

export const NotesButton = styled.button`
  cursor: pointer;
  height: 40px;
  background-color: ${({ theme }) => theme.blue3};
  border: none;
  border-radius: 55px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.grey2};
  }
`;

export const NotsNumber = styled.div`
  border-radius: 38px;
  text-align: center;
  font-weight: 600;
  height: 18px;
  width: 18px;
  position: absolute;
  bottom: 25px;
  left: 30px;
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  transition: all 0.3s;
  border: solid 1px transparent;
  ${NotesButton}:hover &,
  ${NotesButton}:focus & {
    background-color: ${({ theme }) => theme.white};
    border: solid 1px ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

export const NotesLogo = styled.img`
  display: block;
  margin-left: 5px;
`;

export const NotesWrapper = styled.section``;

export const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 25px;
`;
export const ContactNameWrapper = styled.div`
  display: flex;
  margin: auto;
`;

export const ContactNameText = styled(H5)`
  color: ${({ theme }) => theme.blue2};
  font-weight: 600;
  margin-left: 5px;
`;
export const CloseModalButton = styled(BasicButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.black};
  border: none;
  font-size: larger;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue3};
    border: none;
  }
`;

export const AddNewNoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const AddNewNoteForm = styled(BasicForm)`
  display: flex;
  flex-direction: column;
`;

export const NewNoteInput = styled.textarea`
  background-color: ${({ theme }) => theme.grey1};
  border-radius: 10px;
  padding: 10px;
  width: 415px;
  height: 73px;

  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;

export const ChancelEditButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  /* margin: 5px auto; */
  padding: 10px 15px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

export const NotesButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const NewNoteSubmit = styled(InputSubmit)`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  padding: 10px 15px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;
export const NotesListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NotesList = styled.ul`
  padding: 0;
  margin: 0;
`;
