import Head from "next/head";
import type { AppProps } from "next/app";
import AuthProvider from "@/lib/AuthContext";
import "@/styles/globals.css";
import Layout from "@/Components/ui/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Stay-in-Touch</title>
      </Head>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </>
  );
}

export default MyApp;
