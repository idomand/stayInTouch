// import admin from "firebase-admin";
// import serviceAccount from "./serviceAccountKey.json";

// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//       databaseURL: "YOUR_DB_URL",
//     });
//   } catch (error) {
//   }
// }
// export default admin.firestore();

// import { db } from "../lib/Firebase";
// import { collection, addDoc } from "firebase/firestore";

// const myFunc = async () => {
//   const querySnapshot = await getDocs(collection(db, "users"));
//   querySnapshot.forEach((doc) => {
//     console.log(`${doc.id} => ${JSON.stringify(doc.data())} `);
//   });
// };

// // Add a new document with a generated id.
// const docRef = await addDoc(collection(db, "cities"), {
//   name: "Tokyo",
//   country: "Japan",
// });

// console.log("Document written with ID: ", docRef.id);

// export const addData = async () => {};

// myFunc();
