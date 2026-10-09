"use client";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { openGoogleCalendarEvent } from "@/lib/CalendarFunctions";
import { useAuth } from "@/lib/AuthContext";
import { P1 } from "@/Components/ui/Text";
import { basicFormClasses } from "@/Components/ui/formClasses";
import type { ContactListItem } from "@/lib/db/queries/contacts";
import DatePickerComponent from "./DatePickerComponent";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

type AppointmentFormProps = {
  contact: ContactListItem;
  isModalOpenProp: boolean;
  onClose: () => void;
};

/**
 * Mount this only while it is open: the suggested date is worked out from the
 * contact as it is now, so it follows a "mark as talked".
 */
export default function AppointmentForm({
  contact,
  isModalOpenProp,
  onClose,
}: AppointmentFormProps) {
  const t = useTranslations();
  const { currentUser } = useAuth()!;

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

  const [specificReminder, setSpecificReminder] = useState<Date>(
    calculateReminderDate,
  );

  function calendarFunction() {
    const userName = currentUser?.displayName?.split(" ")[0];
    const title = userName
      ? t("appointmentForm.eventTitle", { name, userName })
      : name;
    openGoogleCalendarEvent(title, specificReminder, friendEmail ?? undefined);
  }

  return (
    <Dialog
      title={t("appointmentForm.title", { name })}
      close={onClose}
      isOpen={isModalOpenProp}
    >
      <section className="flex flex-col justify-center sm:flex-row">
        <div className="mr-0 flex flex-col sm:mr-5">
          <div
            className={twMerge(
              basicFormClasses,
              "mt-0 flex flex-col items-start justify-center sm:mt-5 sm:items-center",
            )}
          >
            <P1 extraClasses="mb-2.5 ml-3.5 text-start sm:ml-0">
              {t("appointmentForm.intro")}
            </P1>
            <div className="m-auto sm:m-0">
              <DatePickerComponent
                isInline={true}
                setStartDate={setSpecificReminder}
                startDate={specificReminder}
              />
            </div>
          </div>
          <Button
            buttonText={t("appointmentForm.save")}
            onClick={calendarFunction}
            extraClasses="mt-2 hover:bg-green3 hover:text-blue1"
          >
            <Image
              src="/Google_Calendar.svg"
              alt={t("appointmentForm.calendarAlt")}
              width={35}
              height={35}
              className="mr-2"
            />
          </Button>
        </div>
      </section>
    </Dialog>
  );
}
