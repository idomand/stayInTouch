import React from "react";
import Layout from "../../Components/Layout";

import { useAuth } from "../../lib/AuthContext";

export default function Login() {
  const { loginWithGoogle } = useAuth();

  return (
    <Layout>
      <h1>this is the login</h1>
      <button onClick={loginWithGoogle}>SignInWithGoogle </button>
    </Layout>
  );
}
