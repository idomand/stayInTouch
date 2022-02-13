import React, { useEffect } from "react";
import Layout from "../../Components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import { H1 } from "../../Components/Common/StyledText";

import styled from "styled-components";
import { BasicButton } from "../../Components/Common/StyledButton";

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const SignInButton = styled(BasicButton)`
  display: flex;
  justify-content: space-around;
  &:hover,
  &:focus {
  }
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

const GoogleLogo = styled.img`
  height: 20px;
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
      <LoginWrapper>
        <H1>Login with your Google account</H1>
        <SignInButton onClick={loginWithGoogle}>
          Login
          <GoogleLogo src="/Google-logo.png" />
        </SignInButton>
      </LoginWrapper>
    </Layout>
  );
}
