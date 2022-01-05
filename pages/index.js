import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import styled from "styled-components";

const Foo = styled.button`
  background-color: ${({ theme }) => theme.primaryActiveColor};
`;

export default function Home() {
  return (
    <>
      <div>123</div>
      <Foo>234234234</Foo>
    </>
  );
}
