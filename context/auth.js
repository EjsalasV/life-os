"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth, db } from "@/services/firebase/client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser // <-- Importación modular correcta
} from "firebase/auth";
import { doc, setDoc, onSnapshot, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";

const AuthContext = createContext({});

export const useUser = () => useContext(AuthContext);

// REGLA: Exportación nombrada clara
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Durante deleteAccount el doc desaparece antes que el usuario de Auth;
  // sin esta marca, el fallback isNew mostraría el onboarding un instante.
  const deletingRef = useRef(false);

  useEffect(() => {
    let unsubDoc = null;
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!mounted) return; // Evita memory leak si desmonta durante callback

      // Limpiar listener anterior si existe
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (!mounted) return;
          if (docSnap.exists()) {
            setUser({ uid: authUser.uid, ...docSnap.data() });
          } else if (!deletingRef.current) {
            setUser({ uid: authUser.uid, email: authUser.email, plan: 'free', isNew: true });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (unsubDoc) unsubDoc();
      unsubscribe();
    };
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

  // Firestore NO borra subcolecciones en cascada: hay que vaciarlas una a una.
  const SUBCOLECCIONES = [
    "cuentas", "tarjetas", "fijos", "metas", "presupuestos", "productos",
    "ventas", "habitos", "peso", "movimientos", "salud_diaria", "perfilFisico", "pet"
  ];

  const deleteSubcollection = async (uid, col) => {
    const snap = await getDocs(collection(db, "users", uid, col));
    const docs = snap.docs;
    // Lotes de máx. 450 (límite de Firestore: 500 operaciones por batch)
    for (let i = 0; i < docs.length; i += 450) {
      const batch = writeBatch(db);
      docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    deletingRef.current = true;
    try {
      const uid = auth.currentUser.uid;
      // 1. Borrar subcolecciones de Firestore
      for (const col of SUBCOLECCIONES) {
        await deleteSubcollection(uid, col);
      }
      // 2. Borrar doc del usuario
      await deleteDoc(doc(db, "users", uid));
      // 3. Borrar de Auth
      await deleteUser(auth.currentUser);
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error("Re-autentícate (sal y entra) para borrar la cuenta.");
      }
      throw error;
    } finally {
      deletingRef.current = false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logOut, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
