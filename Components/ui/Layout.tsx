import NavBar from "../NavBar";
import ScrollButtonWrapper from "../ScrollToTopButton";
import Footer from "./Footer";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">{children}</div>
      <Footer />
      <ScrollButtonWrapper />
    </main>
  );
}
