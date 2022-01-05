import styled from "styled-components";
import { BasicButton, GlowButton } from "../Components/Common/Button";
import MainForm from "../Components/MainForm";
import NavBar from "../Components/NavBar";

const HomeWrapper = styled.section`
  background-color: ${({ theme }) => theme.BackgroundColor};
  height: 100vh;
`;

export default function Home() {
  return (
    <HomeWrapper>
      <NavBar />
      <MainForm />
    </HomeWrapper>
  );
}
