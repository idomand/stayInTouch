"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { P, P2 } from "@/Components/ui/Text";
import Card from "@/Components/ui/Card";

export default function GeneralInfoCard() {
  const t = useTranslations();
  const { currentUser } = useAuth()!;

  if (!currentUser) {
    return null;
  }

  return (
    <Card>
      <P extraClasses="text-lg font-semibold mb-2">{t("generalInfo.title")}</P>
      <div className="flex flex-col gap-2">
        {currentUser.displayName && (
          <div className="flex flex-col gap-0.5">
            <P2 extraClasses="text-grey3">{t("generalInfo.name")}</P2>
            <P2 extraClasses="break-all">{currentUser.displayName}</P2>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <P2 extraClasses="text-grey3">{t("generalInfo.email")}</P2>
          <P2 extraClasses="break-all">{currentUser.email}</P2>
        </div>
      </div>
    </Card>
  );
}
