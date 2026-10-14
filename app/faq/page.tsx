import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FiChevronDown } from "react-icons/fi";
import Card from "@/Components/ui/Card";
import PageHeader from "@/Components/ui/PageHeader";
import { P3 } from "@/Components/ui/Text";
import { inviteLimitPerDay } from "@/lib/ConstantsFile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("faq.title") };
}

/** One entry per question, in display order. Each has a question and answer under faq.<key>. */
const QUESTION_KEYS = [
  "whatIsApp",
  "timer",
  "talkHistory",
  "privacy",
  "language",
  "inviteLimit",
  "linking",
  "ownCadence",
  "deleteAccount",
  "deleteWithLinks",
] as const;

/**
 * Public FAQ. Each card is a native <details>, so it opens on click or keyboard
 * with no client JavaScript.
 */
export default async function Faq() {
  const t = await getTranslations();
  const values = { limit: inviteLimitPerDay };

  return (
    <section className="relative mx-auto mb-8 flex w-[90%] flex-col items-center justify-center sm:w-[70%]">
      <PageHeader title={t("faq.title")} />
      {QUESTION_KEYS.map((key) => (
        <Card key={key} extraClasses="m-2 p-0 sm:p-0">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-lg font-semibold sm:p-6 [&::-webkit-details-marker]:hidden">
              {t(`faq.${key}.question`, values)}
              <FiChevronDown
                aria-hidden
                className="text-blue1 shrink-0 transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4 text-left sm:px-6 sm:pb-6">
              <P3>{t(`faq.${key}.answer`, values)}</P3>
            </div>
          </details>
        </Card>
      ))}
    </section>
  );
}
