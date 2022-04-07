import "../styles/globals.css";
import Head from "next/head";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../styles/Theme";
import AuthProvider from "../lib/AuthContext";
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
