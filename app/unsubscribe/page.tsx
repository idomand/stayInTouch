import { getTranslations } from "next-intl/server";
import { H1, P2 } from "@/Components/ui/Text";
import UnsubscribeConfirm from "@/Components/UnsubscribeConfirm";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>;
}) {
  const t = await getTranslations();
  const params = await searchParams;

  const email = typeof params.email === "string" ? params.email : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;

  const hasMissingParams = !email || !token;

  return (
    <section className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-black/5">
        <H1>{t("unsubscribe.title")}</H1>
        {hasMissingParams ? (
          <P2 extraClasses="text-grey3">{t("unsubscribe.missingParams")}</P2>
        ) : (
          <UnsubscribeConfirm email={email} token={token} />
        )}
      </div>
    </section>
  );
}
