import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-WnmeGkCCMYvozooef8hxNBsd6TM7iMM",
  authDomain: "stayintouch-db685.firebaseapp.com",
  projectId: "stayintouch-db685",
  storageBucket: "stayintouch-db685.appspot.com",
  messagingSenderId: "782955743579",
  appId: "1:782955743579:web:7342150910e2447404327e",
};

const FirebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth();

export const provider = new GoogleAuthProvider();

export default FirebaseApp;
