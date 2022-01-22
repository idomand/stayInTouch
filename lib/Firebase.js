import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

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

// !==========FUNCTIONS:=======

export async function addContactToFirestore(userId, userEmail, userData) {
  await addDoc(collection(db, `${userEmail}${userId}`), {
    userData,
  });
}

export async function deleteContact(userId, userEmail, contactId) {
  await deleteDoc(doc(db, `${userEmail}${userId}`, contactId));
}

export async function updateContact(
  userId,
  userEmail,
  contactId,
  newContactData
) {
  await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
    userData: newContactData,
  });
}

export default FirebaseApp;
