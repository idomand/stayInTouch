import React from "react";
import Layout from "../../Components/Layout";
import { H1, P } from "../../Components/Common/StyledText.js";
import styled from "styled-components";
import { BasicLink } from "../../Components/Common/StyledLinks";
import { BasicButton } from "../../Components/Common/StyledButton";
import { addDummyData } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";

const AboutPageWrapper = styled.section`
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 10px;
  position: relative;
`;

const DemoButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const AboutHeader = styled(H1)`
  color: ${({ theme }) => theme.black};
  text-decoration: underline;
`;

const AboutSubSection = styled.div`
  scroll-margin-top: 60px;
  width: 70%;
  padding: 20px;
  text-align: justify;
  border: solid 1px ${({ theme }) => theme.black};
  @media (${({ theme }) => theme.devices.break1}) {
    width: 95%;
  }
`;

const IntroductionSection = styled(AboutSubSection)`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: ${({ theme }) => theme.blue2};
`;

const HowToUseSection = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.white};
`;
const AboutTheSite = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.blue2};
`;
const AboutTheCreator = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.white};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

export default function About() {
  const { currentUser } = useAuth();
  const router = useRouter();

  async function addDemoData() {
    if (currentUser) {
      await addDummyData(currentUser.uid, currentUser.email);
      router.push("/");
    } else {
      router.push("/login");
    }
  }

  return (
    <Layout>
      <AboutPageWrapper>
        <IntroductionSection>
          <AboutHeader>Welcome!</AboutHeader>

          <P>
            This site was created as a way to help people (including myself) to
            stay in touch with the people they care about.
          </P>
          <P>
            As working adults in 2022, we face so many distractions and
            responsibilities that maintaining a stable connection with even our
            closest friends can be difficult.
          </P>
          <P>
            Every one of us has had the experience of waking up one day and
            realizing we have not talked to that good friend from college in a
            couple of months. Thankfully, Stay-in-Touch is here to help!
          </P>
        </IntroductionSection>
        <HowToUseSection id="HowToUseSection">
          <AboutHeader>How to use the site</AboutHeader>
          <P>To begin, simply log into the site using your Google account.</P>
          <P>
            Now just think about the people you want to stay in touch with, and
            when you last spoke to them.
          </P>
          <P>
            All you need to do is enter their names and how often you would like
            to contact them, and Stay-in-Touch will take care of the rest.{" "}
          </P>
          <DemoButtonWrapper>
            <BasicButton onClick={addDemoData}>Demo</BasicButton>
          </DemoButtonWrapper>
        </HowToUseSection>
        <AboutTheSite id="AboutTheSite">
          <AboutHeader>About the site</AboutHeader>
          <P>
            This site was built using the Next.js framework, which extends the
            capabilities of the React.js library. In other words, JavaScript,
            lots of JavaScript.
          </P>
          <P>
            To handle the database and authentication, I have used the Google
            Firebase BaaS. This ensured that all user information would remain
            safe and secure.
          </P>
          <P>
            The design was created by me using the Styled-components CSS-in-JS
            library. By using styled-components and Next.js, I was able to
            create my own design systems with reusable components,
            responsiveness, and a single source of truth for most of the themes
            on this website.
          </P>
          <P>
            {" "}
            you can see the code itself in my GitHub repo right{" "}
            <BasicLink href={"https://github.com/idomand/stayInTouch"}>
              here.
            </BasicLink>
          </P>
        </AboutTheSite>
        <AboutTheCreator id="AboutTheCreator">
          <AboutHeader>About me</AboutHeader>
          <P>
            My name is Ido Mandelman and I am a passionate frontend developer.
          </P>
          <P>
            Originally from Israel, I have moved to Berlin with my wife to start
            a new life in this beautiful city. And I can not wait to join Berlin
            Startups community.
          </P>
          <P>
            In my free time I love reading programming, history and science
            fiction books, cooking and learning German.
          </P>
          <P>
            You can see more of my projects on my{" "}
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
