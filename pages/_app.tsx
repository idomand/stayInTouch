import { GoogleAnalytics } from "@next/third-parties/google";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import AuthProvider from "@/lib/AuthContext";
import "@/styles/globals.css";
import { defaultTheme } from "@/styles/Theme";
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Stay-in-Touch</title>
      </Head>
      <AuthProvider>
        <ThemeProvider theme={defaultTheme}>
          <Component {...pageProps} />
        </ThemeProvider>{" "}
      </AuthProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!} />
      <Analytics />
    </>
  );
}

export default MyApp;
