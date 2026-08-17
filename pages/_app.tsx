import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import AuthProvider from "@/lib/AuthContext";
import "@/styles/globals.css";
import { defaultTheme } from "@/styles/Theme";
import Layout from "@/Components/ui/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Stay-in-Touch</title>
      </Head>
      <AuthProvider>
        <ThemeProvider theme={defaultTheme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>{" "}
      </AuthProvider>
    </>
  );
}

export default MyApp;
