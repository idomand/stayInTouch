import { useEffect } from "react";
import { useRouter } from "next/router";
import ContactDetails from "../Components/ContactDetails";
import MainForm from "../Components/MainForm";
import { useAuth } from "../lib/AuthContext";
import Layout from "../Components/Layout";

export default function Home() {
  const router = useRouter();

  const { currentUser } = useAuth();

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
