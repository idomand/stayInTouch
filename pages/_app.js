import "../styles/globals.css";
import Head from "next/head";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../utils";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Staying in touch</title>
      </Head>
      <ThemeProvider theme={defaultTheme}>
        <Component {...pageProps} />
      </ThemeProvider>{" "}
    </>
  );
}

export default MyApp;
