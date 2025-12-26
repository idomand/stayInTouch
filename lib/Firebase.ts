import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { DocumentData, getFirestore } from "firebase/firestore";
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
import { ContactItemInterface } from "../utils/ContactItemInterface";
import { NoteInterface } from "../utils/NoteInterface";

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
    name: "Your Mom",
    time: 7,
    timeFromLastTalk: Date.now(),
    notesArray: [],
  },
  {
    name: "the Pope",
    time: 14,
    timeFromLastTalk: Date.now(),
    notesArray: [],
  },
  {
    name: "Kanye West",
    time: 21,
    timeFromLastTalk: Date.now(),
    notesArray: [],
  },
];

export async function addDummyData(userId: string, userEmail: string) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray: DocumentData[] = [];
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

async function checkIfContactExists(
  userId: string,
  userEmail: string,
  userData: ContactItemInterface
) {
  const querySnapshot = await getDocs(collection(db, `${userEmail}${userId}`));
  const oldArray: DocumentData[] = [];
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

function addLastTalkNote(contactData: ContactItemInterface) {
  const noteText = "Talked on: " + new Date().toLocaleDateString("en-GB");

  let biggestId;
  if (contactData.notesArray.length === 0) {
    biggestId = 0;
  } else {
    biggestId =
      contactData.notesArray[contactData.notesArray.length - 1].noteId;
  }
  const newNotesArray = [
    ...contactData.notesArray,
    { noteId: biggestId + 1, data: noteText },
  ];
  const newContactData = {
    ...contactData,
    notesArray: newNotesArray,
  };
  return newContactData;
}

// !==========FIRESTORE FUNCTIONS:=======

export async function addContactToFirestore(
  userId: string,
  userEmail: string,
  userData: ContactItemInterface
) {
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
  userId: string,
  userEmail: string,
  contactId: string,
  oldContactData: ContactItemInterface,
  newContactData: ContactItemInterface,
  submitType: "reset" | "edit" | "addNote"
) {
  if (oldContactData.name === newContactData.name) {
    let newContactDataWithTimeStamp = newContactData;

    if (submitType === "reset") {
      newContactDataWithTimeStamp = addLastTalkNote(newContactData);
    }

    await setDoc(doc(db, `${userEmail}${userId}`, contactId), {
      ...newContactDataWithTimeStamp,
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

export async function deleteNote(
  userId: string,
  userEmail: string,
  contactId: string,
  noteId: number
) {
  const notesArrayDocRef = doc(db, `${userEmail}${userId}`, contactId);
  const docSnapRef = await getDoc(notesArrayDocRef);
  const docData = docSnapRef.data();
  const newArray = docData?.notesArray.filter((note: NoteInterface) => {
    if (note.noteId !== noteId) {
      return note;
    }
  });
  await updateDoc(notesArrayDocRef, {
    notesArray: newArray,
  });
}

export async function updateNote(
  userId: string,
  userEmail: string,
  contactId: string,
  noteId: number,
  newNoteData: string
) {
  const notesArrayDocRef = doc(db, `${userEmail}${userId}`, contactId);
  const docSnapRef = await getDoc(notesArrayDocRef);
  const docData = docSnapRef.data();
  const newArray = docData?.notesArray.map((note: NoteInterface) => {
    if (note.noteId === noteId) {
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

export async function deleteContact(
  userId: string,
  userEmail: string,
  contactId: string
) {
  await deleteDoc(doc(db, `${userEmail}${userId}`, contactId));
}
export default FirebaseApp;
