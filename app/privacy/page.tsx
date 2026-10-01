import { getTranslations } from "next-intl/server";
import { H2, P3 } from "@/Components/ui/Text";
import PageHeader from "@/Components/ui/PageHeader";

export default async function Privacy() {
  const t = await getTranslations("Privacy");

  return (
    <section className="flex items-center flex-col justify-center relative w-[90%] sm:w-[70%] mx-auto">
      <PageHeader title={t("title")} />
      <div className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full flex flex-col gap-3">
        <P3 extraClasses="normal-case">{t("intro")}</P3>

        <div className="flex flex-col gap-2">
          <H2>{t("noTrackingTitle")}</H2>
          <P3 extraClasses="normal-case">{t("noTracking")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("dataTitle")}</H2>
          <P3 extraClasses="normal-case">{t("data")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("authTitle")}</H2>
          <P3 extraClasses="normal-case">{t("auth")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("linkingTitle")}</H2>
          <P3 extraClasses="normal-case">{t("linking")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("providersTitle")}</H2>
          <P3 extraClasses="normal-case">{t("providers")}</P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>{t("controlTitle")}</H2>
          <P3 extraClasses="normal-case">{t("control")}</P3>
        </div>
      </div>
    </section>
  );
}
