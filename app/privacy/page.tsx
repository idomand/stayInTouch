import { H2, P3 } from "@/Components/ui/Text";
import PageHeader from "@/Components/ui/PageHeader";

export default function Privacy() {
  return (
    <section className="flex items-center flex-col justify-center relative w-[70%] mx-auto">
      <PageHeader title="Privacy Policy" />
      <div className="bg-white m-2 rounded-[10px] border border-black/10 p-6 text-justify w-full flex flex-col gap-3">
        <P3 extraClasses="normal-case">
          This Privacy Policy explains what information Stay-in-Touch handles,
          how it is used, and the choices you have. By using the app, you agree
          to the practices described below.
        </P3>

        <div className="flex flex-col gap-2">
          <H2>No tracking</H2>
          <P3 extraClasses="normal-case">
            Stay-in-Touch does not track you. The app uses no analytics, no
            advertising cookies, and no third-party tracking of any kind. Your
            activity within the app is not monitored, profiled, or measured for
            any purpose.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Data we store</H2>
          <P3 extraClasses="normal-case">
            The only information the app stores is the data you enter yourself:
            the contacts you add and the reminders you create. This data is kept
            in your own private database and is used solely to provide the
            app&apos;s features to you.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Authentication</H2>
          <P3 extraClasses="normal-case">
            Signing in with Google is used only to create a secure account that
            can access your private database. We do not access your Google
            contacts, email, or any other Google data beyond what is required to
            identify your account.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Data sharing</H2>
          <P3 extraClasses="normal-case">
            Your data is never sold, rented, or shared with third parties. The
            app will never send you marketing or spam messages.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Your control</H2>
          <P3 extraClasses="normal-case">
            You can view, edit, or delete your contacts and reminders at any
            time from within the app. Removing this data removes it from your
            private database.
          </P3>
        </div>
      </div>
    </section>
  );
}
