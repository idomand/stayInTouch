import NavBar from "../NavBar";
import ScrollButtonWrapper from "../ScrollToTopButton";
import { LayoutWrapper } from "./LayoutStyle";

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
