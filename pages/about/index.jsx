import React from "react";
import Layout from "../../Components/Layout";
import { H1, P } from "../../Components/Common/Text.js";
import styled from "styled-components";
import { BasicLink } from "../../Components/Common/Links";
//*============================================================================================================
//?============================================================================================================

const AboutPageWrapper = styled.section`
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 10px;
`;

const AboutHeader = styled(H1)`
  color: ${({ theme }) => theme.black};
  text-decoration: underline;
`;

const AboutSubSection = styled.div`
  scroll-margin-top: 60px;
  width: 90%;
  padding: 20px;
  text-align: justify;

  @media (${({ theme }) => theme.devices.break1}) {
    width: 95%;
  }
`;

const IntroductionSection = styled(AboutSubSection)`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  background-color: ${({ theme }) => theme.nicePurple};
`;

const HowToUseSection = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.lightGreen};
`;
const AboutTheSite = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.nicePurple};
`;
const AboutTheCreator = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.lightGreen};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

//*============================================================================================================
//?============================================================================================================

export default function About() {
  return (
    <Layout>
      <AboutPageWrapper>
        <IntroductionSection>
          <P>
            This site was created as a way to help people (including myself) to
            stay in touch with the people they care about.
          </P>
          <P>
            Working adults in 2022 face such a variety of distraction and
            responsibilities that keeping a stable connection with even our
            closest friends can become a challenge.
          </P>
          <P>
            We all had that moment of realization, waking up one day and
            realizing that we haven’t talk to that good friend from collage in a
            couple of months. Well Staying-In-Touch is here to help!
          </P>
        </IntroductionSection>
        <HowToUseSection id="HowToUseSection">
          <AboutHeader>How to use the site</AboutHeader>
          <P>
            The first step is simply to log into the site using your google
            account.
          </P>
          <P>
            Now you can think about the people you want to stay in touch with,
            and when you’ve lest talked to them.
          </P>
          <P>
            All you need to do is enter their names and how often would you like
            to talk to them, and Staying-In-Touch would do the rest.
          </P>
        </HowToUseSection>
        <AboutTheSite id="AboutTheSite">
          <AboutHeader>About the site</AboutHeader>
          <P>
            The base of the site was build using the Next.js framework, that
            itself extend the faculties of the React.js library. In other word,
            JavaScript, a whole lot of JavaScript.
          </P>
          <P>
            For the database and authentication, I’ve used the wonderful Google
            Firebase BaaS. It allowed me to make sure that the user data would
            remain secure in the best way possible.
          </P>
          <P>
            The design was created by me using the Styled-components CSS-in-JS
            library. The combination of styled-components and Next.js allowed me
            to create my own design systems including reusable components,
            responsiveness and a single source of truth for most of the theme in
            the webpage.
          </P>
          <P> you can see the code itself in my GitHub repo at:</P>
          <P>https://github.com/idomand/stayInTouch</P>
        </AboutTheSite>
        <AboutTheCreator id="AboutTheCreator">
          <AboutHeader>About me</AboutHeader>
          <P>
            My name is Ido Mandelman and I’m a passionate frontend developer.
          </P>
          <P>
            Originally from Israel, I’ve moved to Berlin with my wife to start a
            new life in this beautiful city. And I can’t wait to join Berlin
            Startups community.
          </P>
          <P>
            In my free time I love reading coding books, history and science
            fiction, cooking and learning German.
          </P>
          <P>
            You can see more of my projects in my{" "}
            <BasicLink href={"https://www.hire-ido.com"}>website.</BasicLink>
          </P>
          <P>
            And talk to me on{" "}
            <BasicLink href={"https://www.linkedin.com/in/ido-mandelman"}>
              LinkedIn.
            </BasicLink>
          </P>
        </AboutTheCreator>
      </AboutPageWrapper>
    </Layout>
  );
}
