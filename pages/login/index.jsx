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
  }
`;
const LoginSubSection = styled(LoginPageSubSection)``;
const AboutSubSection = styled(LoginPageSubSection)``;

const SignInButton = styled(BasicButton)`
  margin-top: 20px;
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
          <H1>About the app</H1>
          <P2>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
            accusamus quasi
          </P2>
          <P2>
            voluptas similique voluptates consequuntur asperiores corporis,{" "}
          </P2>
          <P2>
            sed, quod assumenda ut ducimus tempore facilis reiciendis autem
            dolorum nisi accusantium rem?
          </P2>
        </AboutSubSection>
      </LoginPageWrapper>
    </Layout>
  );
}
