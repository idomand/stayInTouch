import React from "react";
import { addDays } from "date-fns";
import { Calendar, Popper, StyledDatePicker } from "./DatePickerComponentStyle";

interface DatePickerComponentProps {
  setStartDate: any;
  // startDate: Date | number;
  startDate: any;
}

export default function DatePickerComponent({
  setStartDate,
  startDate,
}: DatePickerComponentProps) {
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
