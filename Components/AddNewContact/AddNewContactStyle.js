import styled from "styled-components";
import { BasicTextInput, InputSubmit } from "../Common/StyledInput";
import DatePicker from "react-datepicker";

export const InputText = styled(BasicTextInput)`
  min-width: 70px;
  margin: 5px;
`;
export const InputTime = styled(BasicTextInput)`
  width: 45px;
  margin: 5px;
`;
export const AddSubmitInput = styled(InputSubmit)`
  margin-left: 10px;
`;

export const Form = styled.form`
  color: ${({ theme }) => theme.black};
  margin: 10px;
  border: solid 1px;
  padding: 10px;
  border-radius: 10px 10px 0 0;
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
    background-color: ${({ theme }) => theme.white};
  }
`;
