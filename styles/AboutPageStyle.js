import styled from "styled-components";
import { H1 } from "../Components/Common/StyledText";

export const AboutPageWrapper = styled.section`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  position: relative;
  width: 70%;
  margin: auto;
`;

export const DemoButtonWrapper = styled.div`
  display: flex;
  /* justify-content: center; */
`;

export const AboutHeader = styled(H1)``;

export const AboutSubSection = styled.div`
  background-color: ${({ theme }) => theme.white};
  margin: 7.5px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 25px;
  text-align: justify;
  text-transform: capitalize;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const IntroductionSection = styled(AboutSubSection)``;

export const HowToUseSection = styled(AboutSubSection)``;
export const AboutTheSite = styled(AboutSubSection)``;
export const AboutTheCreator = styled(AboutSubSection)``;
