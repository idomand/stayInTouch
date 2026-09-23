"use client";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { createGoogleCalendarEvent } from "@/lib/CalenderFunctions";
import { P1 } from "@/Components/ui/Text";
import { basicFormClasses } from "@/Components/ui/formClasses";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import DatePickerComponent from "./DatePickerComponent";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

type AppointmentFormProps = {
  contact: ContactListItem;
  isModalOpenProp: boolean;
  onClose?: () => void;
};

export default function AppointmentForm({
  contact,
  isModalOpenProp,
  onClose,
}: AppointmentFormProps) {
  const [error, setError] = useState<string | boolean>(false);

  const { name, daysUntilNextTalk, friendEmail } = contact;

  // Suggest the next-talk date: today if overdue or never talked, otherwise
  // that many days out.
  const calculateReminderDate = () => {
    if (daysUntilNextTalk == null || daysUntilNextTalk <= 0) {
      return new Date();
    }
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + Math.ceil(daysUntilNextTalk));
    return reminderDate;
  };

  const [specificReminder, setSpecificReminder] = useState<number | Date>(
    calculateReminderDate(),
  );

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function onCloseModal() {
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  function calenderFunction() {
    const eventDate =
      specificReminder instanceof Date
        ? specificReminder
        : new Date(specificReminder);

    createGoogleCalendarEvent(name, eventDate, friendEmail ?? undefined);
  }

  return (
    <Dialog
      title={`Make Appointment with: ${name}`}
      close={() => {
        onCloseModal();
      }}
      isOpen={isModalOpenProp}
    >
      <section className="flex flex-col justify-center sm:flex-row">
        <div className="mr-0 flex flex-col sm:mr-5">
          <form
            className={twMerge(
              basicFormClasses,
              "mt-0 flex flex-col justify-center items-start sm:mt-5 sm:items-center",
            )}
          >
            <P1 extraClasses="mb-2.5 ml-3.5 text-start sm:ml-0">
              Add this reminder into Google Calender
            </P1>
            <div className="m-auto sm:m-0">
              <DatePickerComponent
                isInline={true}
                setStartDate={setSpecificReminder}
                startDate={specificReminder}
              />
            </div>
          </form>
          <Button
            buttonText="Save to Calender"
            onClick={calenderFunction}
            extraClasses="mt-2 hover:bg-green3 hover:text-blue1"
          >
            <img
              src="/Google_Calendar.svg"
              alt="Google Calendar"
              className="mr-2"
            />
          </Button>
        </div>
      </section>
    </Dialog>
  );
}
