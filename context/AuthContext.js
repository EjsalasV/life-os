"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Creamos el contexto
const AuthContext = createContext({});

// Hook para usar el usuario en cualquier parte
export const useUser = () => useContext(AuthContext);

// Proveedor de autenticación
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar si el usuario está conectado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Función de Registro
  const register = async (email, password, name) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    // Crear documento del usuario en base de datos
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      name,
      email,
      createdAt: serverTimestamp(),
      stats: { currentStreak: 0, lastActivity: null }
    });
    return res;
  };

  // Función de Login (Aquí estaba probablemente el error)
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Función de Salir
  const logOut = () => {
    return signOut(auth);
  };

  // Exportar todo para que la App lo use
  return (
    <AuthContext.Provider value={{ user, register, login, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};