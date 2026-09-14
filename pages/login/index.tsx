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
    <section className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-black/5">
        <div className="flex flex-col items-center gap-2">
          <H1>Welcome back</H1>
          <P2 extraClasses="text-grey3">
            Sign in to manage your reminders and stay in touch with the people
            you care about.
          </P2>
        </div>
        <Button
          extraClasses="w-full gap-3 bg-white text-black border border-grey1 py-2.5 px-4 text-base font-semibold hover:bg-grey1 hover:text-black"
          buttonText="Sign in with Google"
          onClick={loginWithGoogle}
        >
          <img src="/Google-logo.png" alt="" className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
