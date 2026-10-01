import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import AuthProvider from "@/lib/AuthContext";
import Layout from "@/Components/ui/Layout";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stay-in-touch.vip"),
  title: "Stay-in-Touch",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#053BBC",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        {/* Outside AuthProvider so everything under it can use t(). */}
        <NextIntlClientProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
