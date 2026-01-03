import { useRouter } from "next/router";
import { useEffect } from "react";
import ContactDetails from "../Components/ContactDetails";
import Layout from "../Components/Layout";
import MainForm from "../Components/MainForm";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const router = useRouter();

  const { currentUser } = useAuth()!;

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  return (
    <Layout>
      {currentUser && (
        <>
          <MainForm />
          <ContactDetails />
        </>
      )}
    </Layout>
  );
}
