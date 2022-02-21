import React, { useEffect } from "react";
import Layout from "../../Components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import { P2, H1 } from "../../Components/Common/StyledText";
import styled from "styled-components";
import { BasicButton } from "../../Components/Common/StyledButton";

const LoginPageWrapper = styled.section`
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  /* border: solid red; */
  margin: 40px;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
    margin: 20px;
  }
`;
const LoginPageSubSection = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 25px;
  background-color: ${({ theme }) => theme.white};
  margin: 25px;
  height: 60vh;
  @media (${({ theme }) => theme.devices.break1}) {
    height: auto;
    margin: 15px;
  }
`;
const LoginSubSection = styled(LoginPageSubSection)`
  width: 60vw;
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;
const AboutSubSection = styled(LoginPageSubSection)``;

const LoginPageText = styled(P2)`
  line-height: 20px;
  margin-top: 7px;
  text-transform: capitalize;
`;

const SignInButton = styled(BasicButton)`
  margin: 20px auto 0;
  transition: 0.3s all;
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #2d3748;
  color: ${({ theme }) => theme.white};
  border-radius: 5px;
  font-weight: 700;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.white};
    color: #2d3748;
    border: solid;
  }
  @media (${({ theme }) => theme.devices.break1}) {
    max-width: max-content;
    margin: 10px auto 0;
  }
`;

const GoogleLogo = styled.img`
  height: 17px;
  margin: 10px;
`;

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  return (
    <Layout>
      <LoginPageWrapper>
        <LoginSubSection>
          <P2>Welcome Back</P2>
          <H1>Login to your account</H1>

          <SignInButton onClick={loginWithGoogle}>
            <GoogleLogo src="/Google-logo.png" />
            Sign in with Google
          </SignInButton>
        </LoginSubSection>
        <AboutSubSection>
          <H1>About the App</H1>
          <LoginPageText>
            Sign in to your Google Account to create a secure user that can
            access Google Cloud database.
          </LoginPageText>
          <LoginPageText>
            Inside, you will be able to create personal reminders for talking to
            friends and family. The About section of the app contains detailed
            information about using the app, as well as a live demonstration.
          </LoginPageText>
          <LoginPageText>
            The app does not save or use any personal data, except to interact
            with the private database. The app would never send you spam emails
            or pass any information on to third parties.
          </LoginPageText>
        </AboutSubSection>
      </LoginPageWrapper>
    </Layout>
  );
}
