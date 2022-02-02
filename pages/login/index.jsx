import React, { useEffect } from "react";
import Layout from "../../Components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import { BasicButton } from "../../Components/Common/Button";
import styled from "styled-components";
import { H1, H2 } from "../../Components/Common/Text";

//*============================================================================================================
//?============================================================================================================

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 90%;
    margin: auto;
  }
`;

const SignInButton = styled(BasicButton)`
  display: flex;
  margin-top: 15px;
  padding: 10px;
  font-size: ${({ theme }) => theme.typeScale.header1};
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.black};
  width: 15%;
  justify-content: space-around;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue4};
    color: ${({ theme }) => theme.white};
    border: solid 1.5px ${({ theme }) => theme.black};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: 50%;
  }
`;

const GoogleLogo = styled.img`
  height: 40px;
`;

//?============================================================================================================
//!============================================================================================================
//?============================================================================================================

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
