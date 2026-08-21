import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { H1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth()!;
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  return (
    <section className="flex flex-col justify-between m-5 sm:flex-row sm:m-10">
      <div className="flex flex-col rounded-[10px] p-6 bg-white m-3.5 h-auto sm:m-6 sm:h-[60vh] w-auto sm:w-[60vw]">
        <P2>Welcome Back !!!!</P2>
        <H1>Login to your account</H1>
        <Button
          extraClasses="bg-slate-600 hover:text-slate-600 font-bold text-xl
"
          buttonText="Sign in with Google"
          onClick={loginWithGoogle}
        >
          <img src="/Google-logo.png" className="h-4 m-2.5" />
        </Button>
      </div>
      <div className="flex flex-col rounded-[10px] p-6 bg-white m-3.5 h-auto sm:m-6 sm:h-[60vh]">
        <H1>About the App</H1>
        <P2 extraClasses="leading-5 mt-1.5 capitalize">
          Sign in to your Google Account to create a secure user that can access
          Google Cloud database.
        </P2>
        <P2 extraClasses="leading-5 mt-1.5 capitalize">
          Inside, you will be able to create personal reminders for talking to
          friends and family. The About section of the app contains detailed
          information about using the app, as well as a live demonstration.
        </P2>
        <P2 extraClasses="leading-5 mt-1.5 capitalize">
          The app does not save or use any personal data, except to interact
          with the private database. The app would never send you spam emails or
          pass any information on to third parties.
        </P2>
      </div>
    </section>
  );
}
