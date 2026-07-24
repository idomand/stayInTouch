import styled from "styled-components";
import NavBar from "./NavBar";
import ScrollButtonWrapper from "./ScrollToTopButton";

interface LayoutProps {
  children: any;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <LayoutWrapper>
      <NavBar />
      {children}
      <ScrollButtonWrapper />
    </LayoutWrapper>
  );
}

const LayoutWrapper = styled.main``;
