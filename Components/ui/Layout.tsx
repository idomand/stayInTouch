import NavBar from "../NavBar";
import ScrollButtonWrapper from "../ScrollToTopButton";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
      <NavBar />
      {children}
      <ScrollButtonWrapper />
    </main>
  );
}
