import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FiChevronDown } from "react-icons/fi";
import Card from "@/Components/ui/Card";
import OpenDetailsFromHash from "@/Components/ui/OpenDetailsFromHash";
import PageHeader from "@/Components/ui/PageHeader";
import { P3 } from "@/Components/ui/Text";
import {
  inviteLimitPerDay,
  overdueReminderDelayHours,
} from "@/lib/ConstantsFile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("faq.title") };
}

/** One entry per question, in display order. Each has a question and answer under faq.<key>. */
const QUESTION_KEYS = [
  "whatIsApp",
  "installAndroid",
  "timer",
  "overdueReminders",
  "talkHistory",
  "privacy",
  "language",
  "inviteLimit",
  "linking",
  "ownCadence",
  "deleteAccount",
  "deleteWithLinks",
] as const;

/** Screenshot steps shown under the installAndroid answer. Sizes are the PNGs' real pixels. */
const ANDROID_INSTALL_STEPS = [
  {
    key: "step1",
    src: "/android-download/android-download-1.png",
    width: 610,
    height: 1307,
  },
  {
    key: "step2",
    src: "/android-download/android-download-2.png",
    width: 609,
    height: 1309,
  },
  {
    key: "step3",
    src: "/android-download/android-download-3.png",
    width: 617,
    height: 1317,
  },
  {
    key: "step4",
    src: "/android-download/android-download-4.png",
    width: 606,
    height: 1312,
  },
] as const;

/**
 * Public FAQ. Each card is a native <details>, so it opens on click or keyboard
 * with no client JavaScript.
 */
export default async function Faq() {
  const t = await getTranslations();
  const values = {
    limit: inviteLimitPerDay,
    hours: overdueReminderDelayHours,
  };

  return (
    <section className="relative mx-auto mb-8 flex w-[90%] flex-col items-center justify-center sm:w-[70%]">
      <PageHeader title={t("faq.title")} />
      <OpenDetailsFromHash />
      {QUESTION_KEYS.map((key) => (
        <Card key={key} extraClasses="m-2 p-0 sm:p-0">
          <details id={key} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-lg font-semibold sm:p-6 [&::-webkit-details-marker]:hidden">
              {t(`faq.${key}.question`, values)}
              <FiChevronDown
                aria-hidden
                className="text-blue1 shrink-0 transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4 text-left sm:px-6 sm:pb-6">
              <P3>{t(`faq.${key}.answer`, values)}</P3>
              {key === "installAndroid" && (
                <ol className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {ANDROID_INSTALL_STEPS.map((step, index) => (
                    <li
                      key={step.key}
                      className="flex flex-col items-center gap-2"
                    >
                      <P3 extraClasses="font-semibold">
                        {t("faq.installAndroid.stepLabel", {
                          number: index + 1,
                        })}
                      </P3>
                      <P3 extraClasses="text-center">
                        {t(`faq.installAndroid.${step.key}`)}
                      </P3>
                      <Image
                        src={step.src}
                        width={step.width}
                        height={step.height}
                        className="border-grey3 h-auto w-full max-w-60 rounded-lg border"
                        alt=""
                      />
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </details>
        </Card>
      ))}
    </section>
  );
}
