import styled from "styled-components";
import { MinimalButton } from "../Common/StyledButton";

export const NoteItemWrapper = styled.li`
  list-style-type: none;
  padding: 5px;
  margin: 5px;
  display: flex;
  flex-direction: column;
`;

export const NoteItemHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const NoteItemHeaderText = styled.div``;

export const NoteItemButtonWrapper = styled.div``;

export const NoteDataWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.blue2};
  padding: 5px;
  background-color: ${({ theme }) => theme.grey1};
  overflow: auto;
  width: 380px;
  height: 50px;
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;
export const TalkedOnWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.green2};
  padding: 5px;
  background-color: ${({ theme }) => theme.grey1};
  overflow: auto;
  width: 380px;
  height: 50px;
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;

export const EditNoteButton = styled(MinimalButton)`
  padding: 3px;
  &:hover,
  &:focus {
    border-radius: 3px;

    color: ${({ theme }) => theme.blue1};
    background: ${({ theme }) => theme.blue3};
  }
`;

export const DeleteNoteButton = styled(MinimalButton)`
  margin-left: 15px;
  padding: 3px;
  &:hover,
  &:focus {
    border-radius: 3px;

    background: ${({ theme }) => theme.red2};
    color: ${({ theme }) => theme.red1};
  }
`;
