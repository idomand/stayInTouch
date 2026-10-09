"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { optOutEmail } from "@/lib/actions/email";
import { P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";
import ErrorWarning from "@/Components/ErrorWarning";

type Props = {
  email: string;
  token: string;
};

export default function UnsubscribeConfirm({ email, token }: Props) {
  const t = useTranslations();
  const [status, setStatus] = useState<"idle" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOptOut() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await optOutEmail(email, token);
        if (result.ok) {
          setStatus("done");
        } else {
          setError(result.error);
        }
      } catch (caughtError) {
        console.error("Opt-out failed:", caughtError);
        setError(t("unsubscribe.failed"));
      }
    });
  }

  if (status === "done") {
    return <P2 extraClasses="text-green2">{t("unsubscribe.done")}</P2>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <P2 extraClasses="text-grey3">
        {t.rich("unsubscribe.confirmText", {
          email,
          strong: (chunks) => <strong className="text-black">{chunks}</strong>,
        })}
      </P2>
      <Button
        extraClasses="w-full py-2.5 text-base font-semibold"
        buttonText={
          isPending ? t("unsubscribe.working") : t("unsubscribe.confirm")
        }
        onClick={handleOptOut}
        disabled={isPending}
      />
      {error && <ErrorWarning errorMessage={error} />}
    </div>
  );
}
