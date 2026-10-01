import { H2, P3 } from "@/Components/ui/Text";
import PageHeader from "@/Components/ui/PageHeader";

export default function Privacy() {
  return (
    <section className="flex items-center flex-col justify-center relative w-[90%] sm:w-[70%] mx-auto">
      <PageHeader title="Privacy Policy" />
      <div className="bg-white m-2 rounded-[10px] border border-black/10 p-4 sm:p-6 text-left sm:text-justify w-full flex flex-col gap-3">
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
            The app stores only what you enter yourself: your contacts, how
            often you want to talk to each one, your notes, the dates you
            talked, and an optional email for each contact. All accounts share
            one database, and every record is tied to your account, so other
            users cannot see your data.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Authentication</H2>
          <P3 extraClasses="normal-case">
            You can sign in with Google or with an email and password. Sign-in
            is handled by Firebase Authentication. We use your name and email
            only to identify your account and to show them to people you send a
            link request to. We do not access your Google contacts, email, or
            any other Google data.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Linking with friends</H2>
          <P3 extraClasses="normal-case">
            If you send a link request, the person you send it to sees your
            name and email. After they accept, a talk marked on one side is also
            recorded on the other. Your friend sees only the dates of those
            talks. Your notes, contact names and talk frequency are never
            shared.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Service providers</H2>
          <P3 extraClasses="normal-case">
            Your data is stored and processed by Firebase (Google), Neon and
            Vercel, only to run the app. It is never sold or rented, and the
            app will never send you marketing or spam messages.
          </P3>
        </div>

        <div className="flex flex-col gap-2">
          <H2>Your control</H2>
          <P3 extraClasses="normal-case">
            You can view, edit, or delete your contacts and notes at any time.
            Deleting a contact also deletes its notes and talk history. You can
            unlink a contact at any time to stop sharing talks.
          </P3>
        </div>
      </div>
    </section>
  );
}
