import React from "react";
import styled from "styled-components";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Calendar = styled.div`
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(27, 37, 86, 0.16);
  overflow: hidden;
`;
const Popper = styled.div`
  position: absolute;

  margin: auto;
  top: 0;
  left: 0;
  z-index: 2;
`;

const StyledDatePicker = styled(({ className, ...props }) => (
  <DatePicker {...props} wrapperClassName={className} />
))`
  /* width: 90px; */

  & .react-datepicker__input-container {
    /* width: 90px; */
  }
  & .react-datepicker__input-container input {
    /* width: 90px; */
    background-color: lightgrey;
    border-radius: 10px;
    height: 30px;
    text-align: center;
    border: none;
  }

  @media (${({ theme }) => theme.devices.break1}) {
    .react-datepicker__input-container input {
      max-width: 100%;
    }
  }
`;

export default function DatePickerComponent({ setStartDate, startDate }) {
  return (
    <>
      <StyledDatePicker
        className="datePickerClass"
        maxDate={addDays(new Date(), 0)}
        CalendarContainer={Calendar}
        popperContainer={Popper}
        dateFormat="dd/MM/yyyy"
        selected={startDate}
        onChange={setStartDate}
        popperPlacement="auto"
      />
    </>
  );
}
