import React from "react";
import { addDays } from "date-fns";
import { de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { twMerge } from "tailwind-merge";

// English needs no registration: it is react-datepicker's built-in default.
registerLocale("de", de);

type DatePickerComponentProps = {
  setStartDate: (date: Date) => void;
  /** `null` shows an empty field; only meaningful together with `onClear`. */
  startDate: number | Date | null;
  isInline?: boolean;
  /** Latest selectable day. Defaults to 90 days ahead (appointments). */
  maxDate?: Date;
  /** When given, the field can be emptied; called when the user clears it. */
  onClear?: () => void;
};

export default function DatePickerComponent({
  setStartDate,
  startDate,
  isInline = false,
  maxDate = addDays(new Date(), 90),
  onClear,
}: DatePickerComponentProps) {
  const t = useTranslations();
  const locale = useLocale();

  let selected: Date | null = null;
  if (startDate != null) {
    selected = startDate instanceof Date ? startDate : new Date(startDate);
  }

  return (
    <>
      <DatePicker
        wrapperClassName="datePickerClass"
        maxDate={maxDate}
        calendarContainer={Calendar}
        popperContainer={Popper}
        dateFormat={t("datePicker.dateFormat")}
        locale={locale === "en" ? undefined : locale}
        selected={selected}
        onChange={(date) => (date ? setStartDate(date) : onClear?.())}
        isClearable={onClear != null}
        inline={isInline}
      />
    </>
  );
}

const Calendar = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={twMerge(
      "rounded-[10px] shadow-[0_6px_12px_rgba(27,37,86,0.16)] overflow-hidden",
      className,
    )}
  >
    {children}
  </div>
);

const Popper = ({ children }: { children?: React.ReactNode }) => (
  <div className="absolute m-auto top-0 left-0 z-20000">{children}</div>
);
