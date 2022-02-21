import React, { useEffect } from "react";
import Layout from "../../Components/Layout";

import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import {
  AboutSubSection,
  GoogleLogo,
  LoginPageText,
  LoginPageWrapper,
  LoginSubSection,
  SignInButton,
} from "../../styles/LoginPageStyle";
import { H1, P2 } from "../../Components/Common/StyledText";

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
