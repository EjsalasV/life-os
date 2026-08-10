"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth } from "@/services/firebase/client";
import {
  createUserProfile,
  subscribeUserProfile
} from "@/services/firebase/authService";
import { deleteAccountSafely } from "@/modules/auth/use-cases/deleteAccount";
import { requestAccountDeletion } from "@/services/api/backendService";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";

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
        unsubDoc = subscribeUserProfile(authUser.uid, (docSnap) => {
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
    await createUserProfile(res.user.uid, {
      name,
      email,
      plan: "free",
      isNew: true,
      createdAt: new Date(),
    });
    return res;
  };

  const logOut = () => signOut(auth);

  const deleteAccount = async (password) => {
    if (!auth.currentUser) return;
    if (!password) throw new Error("Escribe tu contraseña para continuar.");
    deletingRef.current = true;
    try {
      const email = auth.currentUser.email;
      if (!email) throw new Error("La cuenta no tiene un correo válido.");

      const credential = EmailAuthProvider.credential(email, password);
      await deleteAccountSafely({
        reauthenticate: () => reauthenticateWithCredential(auth.currentUser, credential),
        deleteRemotely: async () => {
          await requestAccountDeletion();
          await signOut(auth);
        }
      });
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
