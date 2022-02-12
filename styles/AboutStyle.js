import styled from "styled-components";
import { H1 } from "../Components/Common/StyledText";

export const AboutPageWrapper = styled.section`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
`;

export const DemoButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const AboutHeader = styled(H1)``;

export const AboutSubSection = styled.div`
  text-align: justify;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const IntroductionSection = styled(AboutSubSection)``;

export const HowToUseSection = styled(AboutSubSection)``;
export const AboutTheSite = styled(AboutSubSection)``;
export const AboutTheCreator = styled(AboutSubSection)``;
