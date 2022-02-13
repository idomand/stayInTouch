import React from "react";
import styled from "styled-components";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";

const Calendar = styled.div`
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(27, 37, 86, 0.16);
  overflow: hidden;
`;
const Popper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

const StyledDatePicker = styled(({ className, ...props }) => (
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

export default function DatePickerComponent({ setStartDate, startDate }) {
  return (
    <>
      <StyledDatePicker
        maxDate={addDays(new Date(), 0)}
        CalendarContainer={Calendar}
        popperContainer={Popper}
        dateFormat="dd/MM/yyyy"
        selected={startDate}
        onChange={(date) => setStartDate(date)}
      />
    </>
  );
}
