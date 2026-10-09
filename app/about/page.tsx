import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { H2, P3 } from "@/Components/ui/Text";
import Link from "@/Components/ui/Link";
import PageHeader from "@/Components/ui/PageHeader";
import Card from "@/Components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("about.title") };
}

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
  const t = await getTranslations();

  return (
    <section className="relative mx-auto flex w-[90%] flex-col items-center justify-center sm:w-[70%]">
      <PageHeader title={t("about.title")} />
      <Card extraClasses="m-2 text-left sm:text-justify">
        <H2>{t("about.aboutApp")}</H2>
        <P3>
          {t("about.intro1")}
          <br />
          {t("about.intro2")}
        </P3>
      </Card>
      <Card id="HowToUseSection" extraClasses="m-2 text-left sm:text-justify">
        <H2>{t("about.howToUse")}</H2>
        <P3>{t("about.howTo1")}</P3>
        <P3>{t("about.howTo2")}</P3>
        <P3>{t("about.howTo3")}</P3>
        <P3>{t("about.howTo4")}</P3>
      </Card>

      <Card id="AboutTheCreator" extraClasses="m-2 text-left sm:text-justify">
        <H2>{t("about.aboutMe")}</H2>
        <P3>{t("about.me1")}</P3>
        <P3>{t("about.me2")}</P3>
        <P3>{t("about.me3")}</P3>
        <P3>
          {t.rich("about.github", {
            link: externalLink("https://github.com/idomand/stayInTouch"),
          })}
        </P3>
        <P3>
          {t.rich("about.website", {
            link: externalLink("https://www.hire-ido.com"),
          })}
        </P3>
        <P3>
          {t.rich("about.linkedin", {
            link: externalLink("https://www.linkedin.com/in/ido-mandelman"),
          })}
        </P3>
      </Card>
    </section>
  );
}
