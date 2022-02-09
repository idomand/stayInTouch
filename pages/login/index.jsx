import React, { useEffect } from "react";
import Layout from "../../Components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import { H1 } from "../../Components/Common/StyledText";
import { GoogleLogo, LoginWrapper, SignInButton } from "./LoginStyle";

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
