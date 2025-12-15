import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";

export const ContactItemContainer = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 75vw;
  list-style-type: none;
  margin: 10px 5px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 85vw;
  }
`;
export const ContactItemWrapper = styled.div`
  display: grid;
  flex-grow: 1;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.white};
  border-radius: 15px;
  padding: 10px;
  grid-template-areas:
    "contactDetails contactDates moreOptions moreOptions"
    "contactDetails contactDates notes buttons";

  @media (${({ theme }) => theme.devices.break1}) {
    grid-template-areas:
      "emojiStatus contactDetails contactDetails notes "
      ". contactDetails contactDetails . "
      "contactDates contactDates contactDates contactDates "
      ". buttons buttons ."
      " . moreOptions moreOptions .";
  }
`;

export const NotesButtonWrapper = styled.div`
  grid-area: notes;
`;

export const EmojiWrapper = styled.div`
  font-size: ${({ theme }) => theme.typeScale.header2};
  margin-right: 10px;
  @media (${({ theme }) => theme.devices.break1}) {
    grid-area: emojiStatus;
    margin-right: 0;
    text-align: end;
  }
`;

export const ContactDetailsWrapper = styled.div`
  grid-area: contactDetails;
  display: flex;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
    align-items: center;
  }
`;
export const ContactDetailsSubDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
export const NameContainer = styled.span`
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.header4};
  line-height: 21px;
  text-transform: capitalize;
  width: 100px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 160px;
    text-align: center;
    margin-bottom: 0px;
  }
`;

export const ContactImage = styled.img`
  margin-right: 15px;
  @media (${({ theme }) => theme.devices.break1}) {
    margin: 0;
  }
`;

export const ContactDatesWrapper = styled.div`
  grid-area: contactDates;
  display: flex;
  justify-content: center;

  @media (${({ theme }) => theme.devices.break1}) {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 15px;
    margin-top: 15px;
    margin-bottom: 20px;
  }
`;
export const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 15px;
`;
export const DateHeader = styled.div`
  color: ${({ theme }) => theme.grey3};
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  margin-bottom: 6px;
`;

interface DateValueProps {
  readonly statusColor: boolean;
}

export const DateValue = styled.span<DateValueProps>`
  color: ${({ theme, statusColor }) => {
    if (!statusColor) {
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

export const MoreOptionsWrapper = styled.div`
  grid-area: moreOptions;
  display: flex;
  justify-content: flex-end;
  @media (${({ theme }) => theme.devices.break1}) {
    justify-content: center;
    margin-top: 15px;
  }
`;

export const ButtonsWrapper = styled.div`
  grid-area: buttons;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ResetButton = styled(BasicButton)``;

export const AddToGoogle = styled(BasicButton)`
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.green2};
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.green2};
    background-color: ${({ theme }) => theme.green1};
    border: ${({ theme }) => theme.green2} 1.3px solid;
  }
`;
