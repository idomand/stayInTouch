import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/lib/AuthContext";
import { PendingRequestCountProvider } from "@/lib/PendingRequestCountContext";
import NavBar from "@/Components/layout/NavBar";
import ScrollButtonWrapper from "@/Components/layout/ScrollToTopButton";
import Footer from "@/Components/layout/Footer";
import ServiceWorkerRegistration from "@/Components/layout/ServiceWorkerRegistration";
import "@/styles/globals.css";
import AnalyticsConsentBanner from "@/Components/layout/AnalyticsConsentBanner";
import { cookies } from "next/headers";
import {
  ANALYTICS_CONSENT_COOKIE,
  isAnalyticsConsent,
} from "@/lib/analytics/analyticsConsentCookie";

export const metadata: Metadata = {
  metadataBase: new URL("https://stay-in-touch.vip"),
  title: { default: "Stay-in-Touch", template: "%s | Stay-in-Touch" },
  manifest: "/manifest.json",
  // iOS ignores the manifest icons and fills transparency with black, so it
  // gets its own opaque icon.
  appleWebApp: {
    capable: true,
    title: "Stay-in-Touch",
    statusBarStyle: "default",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
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

  // Read on the server so the first paint already knows whether to show the
  // banner: no flash for returning visitors, no delay for new ones.
  const savedConsent = (await cookies()).get(ANALYTICS_CONSENT_COOKIE)?.value;
  const initialConsent = isAnalyticsConsent(savedConsent) ? savedConsent : null;

  return (
    <html lang={locale}>
      <body>
        {/* Outside AuthProvider so everything under it can use t(). */}
        <NextIntlClientProvider>
          <AuthProvider>
            <PendingRequestCountProvider>
              <main className="flex min-h-screen flex-col overflow-x-clip">
                <NavBar />
                <div className="flex-1">{children}</div>
                <Footer />
                <ScrollButtonWrapper />
                <ServiceWorkerRegistration />
                <Analytics />
                <AnalyticsConsentBanner initialConsent={initialConsent} />
              </main>
            </PendingRequestCountProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
