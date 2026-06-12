import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Cache persistente (IndexedDB) solo en navegador: la app funciona offline
// y sincroniza al recuperar conexión. En SSR/Node no está soportado.
// initializeFirestore lanza si ya fue inicializado (HMR) → fallback a getFirestore.
function createDb() {
  if (typeof window === "undefined") return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createDb();

export const auth = getAuth(app);

export const messaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export const onlineStatus = {
  isOnline: typeof window !== "undefined" && navigator.onLine,
  listener: null,

  subscribe: (callback) => {
    if (typeof window === "undefined") return;

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
};
