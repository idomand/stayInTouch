import styled from "styled-components";
import { H1 } from "../Components/Common/StyledText";

export const AboutPageWrapper = styled.section`
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 10px;
  position: relative;
`;

export const DemoButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const AboutHeader = styled(H1)`
  color: ${({ theme }) => theme.black};
  text-decoration: underline;
`;

export const AboutSubSection = styled.div`
  scroll-margin-top: 60px;
  width: 70%;
  padding: 20px;
  text-align: justify;
  border: solid 1px ${({ theme }) => theme.black};
  @media (${({ theme }) => theme.devices.break1}) {
    width: 95%;
  }
`;

export const IntroductionSection = styled(AboutSubSection)`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: ${({ theme }) => theme.blue2};
`;

export const HowToUseSection = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.white};
`;
export const AboutTheSite = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.blue2};
`;
export const AboutTheCreator = styled(AboutSubSection)`
  background-color: ${({ theme }) => theme.white};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;
