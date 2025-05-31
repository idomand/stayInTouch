import styled from "styled-components";
import { H2 } from "../Common/StyledText";

import { BasicButton } from "../Common/StyledButton";

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

export const Dialog = styled.dialog`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const DialogHeader = styled(H2)`
  margin-bottom: 50px;
`;

export const DialogButton = styled(BasicButton)``;
