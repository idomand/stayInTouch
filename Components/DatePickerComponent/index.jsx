import React from "react";
import { addDays } from "date-fns";
import { Calendar, Popper, StyledDatePicker } from "./DatePickerComponentStyle";

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
