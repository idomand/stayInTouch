import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("demo.metaTitle") };
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
