import type { Metadata, Viewport } from "next";
import AuthProvider from "@/lib/AuthContext";
import Layout from "@/Components/ui/Layout";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Stay-in-Touch",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#053BBC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
