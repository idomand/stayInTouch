import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  updateDoc,
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

const Dummy_Data = [
  {
    name: "Queen Elizabeth II",
    time: 3,
    timeFromLastTalk: 1644068546000,
    notesArray: [
      { id: 1, data: "Long live the queen" },
      { id: 2, data: "The british empire will never fall!" },
    ],
  },
  {
    name: "Barack Obama",
    time: 5,
    timeFromLastTalk: 1643204546000,
    notesArray: [{ id: 1, data: "Peace & Love" }],
  },
  { name: "Mom", time: 7, timeFromLastTalk: 1641994946000 },
  {
    name: "Kanye West",
    time: 14,
    timeFromLastTalk: 1643636546000,
    notesArray: [{ id: 1, data: "My girl is not a hobbit" }],
  },
  { name: "Mr. Bean", time: 21, timeFromLastTalk: 1643809453000 },
];

export async function addDummyData(userId, userEmail) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray = [];
  querySnapshot.forEach((doc) => {
    oldArray.push(doc.data());
  });
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
  const regexString = `^${userData.name}$`;
  const nameRegex = new RegExp(regexString, "i");
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

export async function updateContact(
  userId,
  userEmail,
  contactId,
  oldContactData,
  newContactData
) {
  if (oldContactData.name === newContactData.name) {
    await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
      ...newContactData,
    });
  } else {
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
}

export async function deleteNote(userId, userEmail, contactId, noteId) {
  const notesArrayDocRef = doc(db, `${userEmail}${userId}`, contactId);
  const docSnapRef = await getDoc(notesArrayDocRef);
  const docData = docSnapRef.data();
  const newArray = docData.notesArray.filter((note) => {
    if (note.id !== noteId) {
      return note;
    }
  });
  await updateDoc(notesArrayDocRef, {
    notesArray: newArray,
  });
}

export async function updateNote(
  userId,
  userEmail,
  contactId,
  noteId,
  newNoteData
) {
  const notesArrayDocRef = doc(db, `${userEmail}${userId}`, contactId);
  const docSnapRef = await getDoc(notesArrayDocRef);
  const docData = docSnapRef.data();
  const newArray = docData.notesArray.map((note) => {
    if (note.id === noteId) {
      let newNote = note;
      newNote.data = newNoteData;
      return newNote;
    } else {
      return note;
    }
  });
  await updateDoc(notesArrayDocRef, {
    notesArray: newArray,
  });
}

export async function deleteContact(userId, userEmail, contactId) {
  await deleteDoc(doc(db, `${userEmail}${userId}`, contactId));
}
export default FirebaseApp;
