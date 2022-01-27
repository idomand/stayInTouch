import React from "react";
import Layout from "../../Components/Layout";
import { H1 } from "../../Components/Common/Text.js";
import styled from "styled-components";

const FirstSection = styled.div`
  height: 400px;
  border: solid red;
  background-color: lightblue;
  scroll-margin-top: 60px;
`;
const SecondSection = styled.div`
  height: 400px;
  border: solid green;
  background-color: lightcoral;
  scroll-margin-top: 60px;
`;
const ThirdSection = styled.div`
  height: 400px;
  border: solid blue;
  background-color: lightcyan;
  scroll-margin-top: 60px;
`;

//*============================================================================================================
//?============================================================================================================

export default function About() {
  return (
    <Layout>
      <h1>this is the about</h1>
      <FirstSection id="firstSection">
        <H1>section 1 : how to use the site</H1>
      </FirstSection>
      <SecondSection id="secondSection">
        <H1>section 2 : about the site</H1>
      </SecondSection>
      <ThirdSection id="thirdSection">
        <H1>section 3 : about me</H1>
      </ThirdSection>
    </Layout>
  );
}
