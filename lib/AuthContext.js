import { auth } from "./Firebase.js";
import React, { useContext, useState, useEffect } from "react";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);
  console.log(`currentUser`, currentUser);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const value = { currentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
