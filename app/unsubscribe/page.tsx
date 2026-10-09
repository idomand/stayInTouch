import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { H1, P2 } from "@/Components/ui/Text";
import UnsubscribeConfirm from "@/Components/UnsubscribeConfirm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("unsubscribe.title") };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string | string[];
    token?: string | string[];
  }>;
}) {
  const t = await getTranslations();
  const params = await searchParams;

  const email = typeof params.email === "string" ? params.email : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;

  const hasMissingParams = !email || !token;

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-black/5 bg-white p-8 text-center shadow-lg">
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
