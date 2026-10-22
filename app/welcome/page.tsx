import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { H1, H2, H3, P1, P2 } from "@/Components/ui/Text";
import Card from "@/Components/ui/Card";
import Link from "@/Components/ui/Link";

// The home URL keeps the plain site title; this page is only shown there to logged-out visitors.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: { absolute: "Stay-in-Touch" },
    description: t("welcome.metaDescription"),
  };
}

/** A rich-text tag that renders its chunk as an internal inline link. */
function textLink(href: string) {
  return function TextLink(chunks: ReactNode) {
    return (
      <Link href={href} variant="Text">
        {chunks}
      </Link>
    );
  };
}

/** Primary button look, as a link. Matches Button's Primary variant, a bit larger. */
function StartLink({ label }: { label: string }) {
  return (
    <Link
      href="/login"
      extraClasses="inline-flex items-center justify-center rounded-md border border-blue1 bg-blue1 px-6 py-3 text-base font-semibold text-white transition duration-200 ease-in hover:border-blue3 hover:bg-blue3 hover:text-blue1"
    >
      {label}
    </Link>
  );
}

const videoIds = {
  problem: { en: "n3Xv_g3g-mA", de: "DwqwRYe6fKA" },
  solution: { en: "I9hJ_Rux9y0", de: "HYuqC13LZ1Q" },
} as const;

/** A titled YouTube embed. The nocookie domain sets no tracking cookies before play. */
function VideoColumn({ title, videoId }: { title: string; videoId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <H2>{title}</H2>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="aspect-video w-full rounded-md"
      />
    </div>
  );
}

export default async function Welcome() {
  const t = await getTranslations();
  const videoLocale = (await getLocale()) === "de" ? "de" : "en";

  const steps = [
    { title: t("welcome.step1Title"), text: t("welcome.step1Text") },
    { title: t("welcome.step2Title"), text: t("welcome.step2Text") },
    { title: t("welcome.linkedTitle"), text: t("welcome.linkedText") },
    { title: t("welcome.step3Title"), text: t("welcome.step3Text") },
  ];

  return (
    <section className="mx-auto flex w-[90%] flex-col items-center gap-12 py-8 text-center sm:w-[70%]">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/friendsLogo.png"
          width={610}
          height={545}
          priority
          className="h-24 w-auto"
          alt={t("navBar.logoAlt")}
        />
        <H1 extraClasses="text-balance">{t("welcome.headline")}</H1>
        <P1 extraClasses="text-grey3 max-w-prose">{t("welcome.subline")}</P1>
        <StartLink label={t("welcome.getStarted")} />
      </div>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        <VideoColumn
          title={t("welcome.problemTitle")}
          videoId={videoIds.problem[videoLocale]}
        />
        <VideoColumn
          title={t("welcome.solutionTitle")}
          videoId={videoIds.solution[videoLocale]}
        />
      </div>

      <div className="flex w-full flex-col gap-4">
        <H2>{t("welcome.howItWorks")}</H2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex">
              <Card extraClasses="flex flex-col items-center gap-3">
                <span
                  aria-hidden="true"
                  className="bg-blue1 flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white"
                >
                  {index + 1}
                </span>
                <H3>{step.title}</H3>
                <P2 extraClasses="text-grey3">{step.text}</P2>
              </Card>
            </li>
          ))}
        </ol>
      </div>

      <P2 extraClasses="text-grey3">
        {t.rich("welcome.privacyNote", { link: textLink("/privacy") })}
      </P2>
    </section>
  );
}
