"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext({});
export const useUser = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email, password, name) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid, name, email, createdAt: serverTimestamp(),
      stats: { currentStreak: 0, lastActivity: null }
    });
    return res;
  };
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logOut = () => signOut(auth);

  return <AuthContext.Provider value={{ user, register, login, logOut, loading }}>{children}</AuthContext.Provider>;
};