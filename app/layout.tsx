import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import AuthProvider from "@/lib/AuthContext";
import { PendingRequestCountProvider } from "@/lib/PendingRequestCountContext";
import NavBar from "@/Components/NavBar";
import ScrollButtonWrapper from "@/Components/ScrollToTopButton";
import Footer from "@/Components/ui/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stay-in-touch.vip"),
  title: { default: "Stay-in-Touch", template: "%s | Stay-in-Touch" },
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
            <PendingRequestCountProvider>
              <main className="flex flex-col min-h-screen overflow-x-clip">
                <NavBar />
                <div className="flex-1">{children}</div>
                <Footer />
                <ScrollButtonWrapper />
              </main>
            </PendingRequestCountProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
