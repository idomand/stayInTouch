import { useRouter } from "next/router";
import { useEffect } from "react";
import styled from "styled-components";
import { BasicButton } from "@/Components/Common/StyledButton";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/Components/Layout";
import { H1, P2 } from "@/Components/Common/StyledText";
import Button from "@/Components/ui/Button";

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth()!;
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
          <P2>Welcome Back !!!!</P2>
          <H1>Login to your account</H1>
          <Button
            extraClasses="bg-slate-600 hover:text-slate-600 font-bold text-xl
"
            buttonText="Sign in with Google"
            onClick={loginWithGoogle}
          >
            <GoogleLogo src="/Google-logo.png" />
          </Button>
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

const LoginPageWrapper = styled.section`
  display: flex;
  justify-content: space-between;
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

const GoogleLogo = styled.img`
  height: 17px;
  margin: 10px;
`;
