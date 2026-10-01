import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { H1, P3 } from "@/Components/ui/Text";
import Link from "@/Components/ui/Link";
import PageHeader from "@/Components/ui/PageHeader";

/** A rich-text tag that renders its chunk as an external link. */
function externalLink(href: string) {
  return function ExternalLink(chunks: ReactNode) {
    return (
      <Link href={href} variant="Text" target="_blank">
        {chunks}
      </Link>
    );
  };
}

export default async function About() {
  const t = await getTranslations("About");

  return (
    <section className="flex items-center flex-col justify-center relative w-[90%] sm:w-[70%] mx-auto">
      <PageHeader title={t("title")} />
      <div className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full">
        <H1>{t("aboutApp")}</H1>
        <P3>
          {t("intro1")}
          <br />
          {t("intro2")}
        </P3>
      </div>
      <div
        id="HowToUseSection"
        className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full"
      >
        <H1>{t("howToUse")}</H1>
        <P3>{t("howTo1")}</P3>
        <P3>{t("howTo2")}</P3>
        <P3>{t("howTo3")}</P3>
        <P3>{t("howTo4")}</P3>
      </div>

      <div
        id="AboutTheCreator"
        className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full"
      >
        <H1>{t("aboutMe")}</H1>
        <P3>{t("me1")}</P3>
        <P3>{t("me2")}</P3>
        <P3>{t("me3")}</P3>
        <P3>
          {t.rich("github", {
            link: externalLink("https://github.com/idomand/stayInTouch"),
          })}
        </P3>
        <P3>
          {t.rich("website", { link: externalLink("https://www.hire-ido.com") })}
        </P3>
        <P3>
          {t.rich("linkedin", {
            link: externalLink("https://www.linkedin.com/in/ido-mandelman"),
          })}
        </P3>
      </div>
    </section>
  );
}
