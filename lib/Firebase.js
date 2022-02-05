import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

//*============================================================================================================
//?============================================================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const FirebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const db = getFirestore();

// !==========HELPER FUNCTIONS:=======

const Dummy_Data = [
  { name: "Queen Elizabeth II", time: 3, timeFromLastTalk: 1644068546000 },
  { name: "Barack Obama", time: 5, timeFromLastTalk: 1643204546000 },
  { name: "Mom", time: 7, timeFromLastTalk: 1641994946000 },
  { name: "Kanye West", time: 14, timeFromLastTalk: 1643636546000 },
  { name: "Mr. Bean", time: 21, timeFromLastTalk: 1643809453000 },
];

export async function addDummyData(userId, userEmail) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray = [];
  querySnapshot.forEach((doc) => {
    oldArray.push(doc.data());
  });
  console.log("oldArray", oldArray);

  Dummy_Data.forEach((dummyContact) => {
    let test = oldArray.find((contact) => contact.name === dummyContact.name);
    if (!test) {
      addDoc(collection(db, `${userEmail}${userId}`), {
        ...dummyContact,
      });
    }
  });
}

async function checkIfContactExists(userId, userEmail, userData) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray = [];
  querySnapshot.forEach((doc) => {
    oldArray.push(doc.data());
  });
  const nameRegex = new RegExp(userData.name, "i");
  const isNewContactUnique = oldArray.find((element) => {
    return nameRegex.test(element.name);
  });
  if (isNewContactUnique) {
    return false;
  } else {
    return true;
  }
}

// !==========FIRESTORE FUNCTIONS:=======

export async function addContactToFirestore(userId, userEmail, userData) {
  const isNewContactUnique = await checkIfContactExists(
    userId,
    userEmail,
    userData
  );

  if (isNewContactUnique) {
    await addDoc(collection(db, `${userEmail}${userId}`), {
      ...userData,
    });
    return "good";
  } else {
    return "bad";
  }
}

export async function updateContactFull(
  userId,
  userEmail,
  contactId,
  newContactData
) {
  const isNewContactUnique = await checkIfContactExists(
    userId,
    userEmail,
    newContactData
  );

  if (isNewContactUnique) {
    await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
      ...newContactData,
    });
    return "good";
  } else {
    return "bad";
  }
}

export async function updateContactTime(
  userId,
  userEmail,
  contactId,
  newContactData
) {
  await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
    ...newContactData,
  });
  return "good";
}

export async function resetTimerForContact(
  userId,
  userEmail,
  contactId,
  newContactData
) {
  await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
    ...newContactData,
  });
}

export async function deleteContact(userId, userEmail, contactId) {
  await deleteDoc(doc(db, `${userEmail}${userId}`, contactId));
}
export default FirebaseApp;
