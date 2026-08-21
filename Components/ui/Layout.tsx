import NavBar from "../NavBar";
import ScrollButtonWrapper from "../ScrollToTopButton";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main>
      <NavBar />
      {children}
      <ScrollButtonWrapper />
    </main>
  );
}
