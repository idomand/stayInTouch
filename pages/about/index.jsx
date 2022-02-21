import React from "react";
import { useRouter } from "next/router";
import Layout from "../../Components/Layout";
import { addDummyData } from "../../lib/Firebase";
import { useAuth } from "../../lib/AuthContext";
import { P3 } from "../../Components/Common/StyledText";
import { BasicButton } from "../../Components/Common/StyledButton";
import { BasicLink } from "../../Components/Common/StyledLinks";

import {
  AboutTheCreator,
  AboutHeader,
  AboutPageWrapper,
  AboutTheSite,
  DemoButtonWrapper,
  HowToUseSection,
  IntroductionSection,
} from "../../styles/AboutPageStyle";

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

          <P3>
            This site was created as a way to help people (including myself) to
            stay in touch with the people they care about.
          </P3>
          <P3>
            As working adults in 2022, we face so many distractions and
            responsibilities that maintaining a stable connection with even our
            closest friends can be difficult.
          </P3>
          <P3>
            Every one of us has had the experience of waking up one day and
            realizing we have not talked to that good friend from college in a
            couple of months. Thankfully, Stay-in-Touch is here to help!
          </P3>
        </IntroductionSection>
        <HowToUseSection id="HowToUseSection">
          <AboutHeader>How to use the site</AboutHeader>
          <P3>To begin, simply log into the site using your Google account.</P3>
          <P3>
            Now just think about the people you want to stay in touch with, and
            when you last spoke to them.
          </P3>
          <P3>
            All you need to do is enter their names and how often you would like
            to contact them, and Stay-in-Touch will take care of the rest.{" "}
          </P3>
          <DemoButtonWrapper>
            <BasicButton onClick={addDemoData}>Demo</BasicButton>
          </DemoButtonWrapper>
        </HowToUseSection>
        <AboutTheSite id="AboutTheSite">
          <AboutHeader>About the site</AboutHeader>
          <P3>
            This site was built using the Next.js framework, which extends the
            capabilities of the React.js library. In other words, JavaScript,
            lots of JavaScript.
          </P3>
          <P3>
            To handle the database and authentication, I have used the Google
            Firebase BaaS. This ensured that all user information would remain
            safe and secure.
          </P3>
          <P3>
            The design was created by me using the Styled-components CSS-in-JS
            library. By using styled-components and Next.js, I was able to
            create my own design systems with reusable components,
            responsiveness, and a single source of truth for most of the themes
            on this website.
          </P3>
          <P3>
            {" "}
            you can see the code itself in my GitHub repo right{" "}
            <BasicLink href={"https://github.com/idomand/stayInTouch"}>
              here.
            </BasicLink>
          </P3>
        </AboutTheSite>
        <AboutTheCreator id="AboutTheCreator">
          <AboutHeader>About me</AboutHeader>
          <P3>
            My name is Ido Mandelman and I am a passionate frontend developer.
          </P3>
          <P3>
            Originally from Israel, I have moved to Berlin with my wife to start
            a new life in this beautiful city. And I can not wait to join Berlin
            Startups community.
          </P3>
          <P3>
            In my free time I love reading programming, history and science
            fiction books, cooking and learning German.
          </P3>
          <P3>
            You can see more of my projects on my{" "}
            <BasicLink href={"https://www.hire-ido.com"}>website.</BasicLink>
          </P3>
          <P3>
            And talk to me on{" "}
            <BasicLink href={"https://www.linkedin.com/in/ido-mandelman"}>
              LinkedIn.
            </BasicLink>
          </P3>
        </AboutTheCreator>
      </AboutPageWrapper>
    </Layout>
  );
}
