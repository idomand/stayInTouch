// pages/_document.tsx
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#053BBC" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
