import { clamp } from "date-fns";
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

async function checkIfContactExists(userId, userEmail, userData) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray = [];
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    oldArray.push(doc.data());
  });

  const isNewContactUnique = oldArray.find((element) => {
    return element.name === userData.name;
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
export async function updateContact(
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

//!======== old versions - working functions=====start====
// export async function addContactToFirestore(userId, userEmail, userData) {
//   await addDoc(collection(db, `${userEmail}${userId}`), {
//     ...userData,
//   });
// }

// export async function updateContact(
//   userId,
//   userEmail,
//   contactId,
//   newContactData
//   ) {
//   await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
//     ...newContactData,
//   });
// }
//!========working function=====end====

export async function deleteContact(userId, userEmail, contactId) {
  await deleteDoc(doc(db, `${userEmail}${userId}`, contactId));
}
export default FirebaseApp;
