import { redirect } from "next/navigation";
import ContactList from "@/Components/ContactList";
import MainForm from "@/Components/MainForm";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getContactsForCurrentUser } from "@/lib/db/queries/contacts";

export default async function Home() {
  // Server-side gate: redirect before render instead of the old client
  // useEffect -> router.push that flashed an empty page first.
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const contacts = await getContactsForCurrentUser();

  return (
    <>
      <MainForm />
      <ContactList contacts={contacts} />
    </>
  );
}
