import React, { useEffect } from "react";
import Layout from "../../Components/Layout";
import { useRouter } from "next/router";

import { useAuth } from "../../lib/AuthContext";

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  return (
    <Layout>
      <h1>this is the login</h1>
      <button onClick={loginWithGoogle}>SignInWithGoogle </button>
    </Layout>
  );
}
