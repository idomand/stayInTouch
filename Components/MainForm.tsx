import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import AddNewContact from "./AddNewContact";
import { showArt } from "./SecretGame";
import { H1 } from "@/Components/ui/Text";
import Button from "./ui/Button";

export default function MainForm() {
  const { currentUser } = useAuth()!;
  const [hiddenGameIndicator, setHiddenGameIndicator] = useState(false);
  const [showMainForm, setShowMainForm] = useState(false);

  function startGame() {
    setHiddenGameIndicator((value) => !value);
    showArt();
  }

  return (
    <>
      <section className="flex items-center mt-1 mx-5 sm:block sm:ml-5 sm:mt-0 sm:mr-0">
        <div className="flex justify-between w-full">
          <H1 extraClasses="pt-2.5">
            <span
              onClick={startGame}
              className={`cursor-pointer ${
                hiddenGameIndicator ? "text-red1" : "text-black"
              }`}
            >
              Hi
            </span>{" "}
            {currentUser?.displayName}
          </H1>
        </div>
        <div>
          <Button
            buttonText="Make a friend!"
            onClick={() => setShowMainForm(!showMainForm)}
          />
        </div>
      </section>
      {showMainForm && <AddNewContact />}
    </>
  );
}
