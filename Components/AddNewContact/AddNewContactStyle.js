import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { BasicTextInput, InputSubmit } from "../Common/StyledFormElements";

export const InputText = styled(BasicTextInput)``;
export const InputTime = styled(BasicTextInput)``;

export const AddSubmitInput = styled(InputSubmit)`
  background-color: ${({ theme }) => theme.green_1};
  color: ${({ theme }) => theme.white};
  transition: all 0.5s;
  &:hover,
  &:focus {
    background: rgba(2, 207, 96, 0.1);
    border: 1.3px solid ${({ theme }) => theme.green_1};
    color: ${({ theme }) => theme.green_1};
  }
`;

export const DatePickerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const Calendar = styled.div`
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(27, 37, 86, 0.16);
  overflow: hidden;
`;
export const Popper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

export const DatePickerComponent = styled(({ className, ...props }) => (
  <DatePicker {...props} wrapperClassName={className} />
))`
  width: 90px;

  & .react-datepicker__input-container {
    width: 90px;
  }
  & .react-datepicker__input-container input {
    width: 90px;

    border-radius: 5px;
  }
`;
