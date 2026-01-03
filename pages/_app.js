import Head from "next/head";
import { ThemeProvider } from "styled-components";
import AuthProvider from "../lib/AuthContext";
import "../styles/globals.css";
import { defaultTheme } from "../styles/Theme";

function MyApp({ Component, pageProps }) {
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
    </>
  );
}

export default MyApp;
