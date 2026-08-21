import { useEffect, useState } from "react";
import { createGoogleCalendarEvent } from "../lib/CalenderFunctions";
import { oneDay } from "../lib/ConstantsFile";
import { ContactItemType } from "../types/ContactItemType";
import { H5, P1 } from "@/Components/ui/Text";
import { basicFormClasses } from "@/Components/ui/formClasses";
import { twMerge } from "tailwind-merge";
import DatePickerComponent from "./DatePickerComponent";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

type AppointmentFormState = Omit<
  ContactItemType,
  "contactId" | "notesArray"
> & {
  isModalOpenProp: boolean;
  onClose?: () => void;
};

export default function AppointmentForm({
  name,
  time,
  timeFromLastTalk,
  friendEmail,
  isModalOpenProp,
  onClose,
}: AppointmentFormState) {
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenProp);
  const [error, setError] = useState<string | boolean>(false);
  const currantTime = new Date().getTime();

  let nextTalkInDays =
    time - Math.floor((currantTime - timeFromLastTalk) / oneDay);

  // Calculate the specific reminder date based on nextTalkInDays
  const calculateReminderDate = () => {
    if (nextTalkInDays <= 0) {
      return new Date(); // If overdue, use today
    }
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + nextTalkInDays);
    return reminderDate;
  };

  const [specificReminder, setSpecificReminder] = useState<number | Date>(
    calculateReminderDate(),
  );

  useEffect(() => {
    setIsModalOpen(isModalOpenProp);
  }, [isModalOpenProp]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  function onCloseModal() {
    setIsModalOpen(false);
    if (error) {
      setError(false);
    }
    if (onClose) {
      onClose();
    }
  }

  function calenderFunction() {
    // Open Google Calendar dialog directly
    const eventDate =
      specificReminder instanceof Date
        ? specificReminder
        : new Date(specificReminder);

    createGoogleCalendarEvent(name, eventDate, friendEmail);
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
