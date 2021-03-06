import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../lib/AuthContext";
import { db } from "../../lib/Firebase";
import { oneDay } from "../../lib/ConstantsFile";
import { ContactItemInterface } from "../ContactItemInterface";

export default function useSnapshotData() {
  const [basicArray, SetBasicArray] = useState<ContactItemInterface[]>([]);

  const { currentUser } = useAuth()!;

  const currantTime = new Date().getTime();

  useEffect(() => {
    if (currentUser == null || currentUser.email == null) return;

    const unsubscribe = onSnapshot(
      collection(db, `${currentUser.email}${currentUser.uid}`),
      (snapshot) => {
        SetBasicArray(
          snapshot.docs.map((doc) => {
            let contactObject = doc.data() as ContactItemInterface;
            contactObject.contactId = doc.id;
            contactObject.timeUntilNextTalk = +(
              contactObject.time -
              (currantTime - contactObject.timeFromLastTalk) / oneDay
            ).toFixed(1);
            return contactObject;
          })
        );
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return basicArray;
}
