import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { H2, P3 } from "@/Components/ui/Text";
import PageHeader from "@/Components/ui/PageHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("privacy.title") };
}

export default async function Privacy() {
  const t = await getTranslations();

  return (
    <section className="flex items-center flex-col justify-center relative w-[90%] sm:w-[70%] mx-auto">
      <PageHeader title={t("privacy.title")} />
      <div className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full flex flex-col gap-3">
        <P3 extraClasses="normal-case">{t("privacy.intro")}</P3>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.noTrackingTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.noTracking")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.dataTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.data")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.authTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.auth")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.linkingTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.linking")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.nonUsersTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.nonUsers")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.providersTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.providers")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("privacy.controlTitle")}</H2>
          <P3 extraClasses="normal-case">{t("privacy.control")}</P3>
        </div>
      </div>
    </section>
  );
}
