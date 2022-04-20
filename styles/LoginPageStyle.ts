import { P2 } from "../Components/Common/StyledText";
import styled from "styled-components";
import { BasicButton } from "../Components/Common/StyledButton";

export const LoginPageWrapper = styled.section`
  display: flex;
  justify-content: space-between;
  margin: 40px;
  @media (${({ theme }) => theme.devices.break1}) {
    flex-direction: column;
    margin: 20px;
  }
`;
export const LoginPageSubSection = styled.div`
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
export const LoginSubSection = styled(LoginPageSubSection)`
  width: 60vw;
  @media (${({ theme }) => theme.devices.break1}) {
    width: auto;
  }
`;
export const AboutSubSection = styled(LoginPageSubSection)``;

export const LoginPageText = styled(P2)`
  line-height: 20px;
  margin-top: 7px;
  text-transform: capitalize;
`;

export const SignInButton = styled(BasicButton)`
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

export const GoogleLogo = styled.img`
  height: 17px;
  margin: 10px;
`;
