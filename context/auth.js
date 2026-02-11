"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser // <-- Importación modular correcta
} from "firebase/auth";
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useUser = () => useContext(AuthContext);

// REGLA: Exportación nombrada clara
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: authUser.uid, ...docSnap.data() });
          } else {
            setUser({ uid: authUser.uid, email: authUser.email, plan: 'free', isNew: true });
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      name,
      email,
      plan: "free",
      isNew: true,
      createdAt: new Date(),
    });
    return res;
  };

  const logOut = () => signOut(auth);

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;
      // 1. Borrar de Firestore
      await deleteDoc(doc(db, "users", uid));
      // 2. Borrar de Auth
      await deleteUser(auth.currentUser);
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error("Re-autentícate (sal y entra) para borrar la cuenta.");
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logOut, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};