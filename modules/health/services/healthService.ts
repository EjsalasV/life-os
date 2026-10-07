import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/client";

const userCollection = (uid: string, name: string) => collection(db, "users", uid, name);
const userDocument = (uid: string, name: string, id: string) => doc(db, "users", uid, name, id);

export const healthService = {
  timestamp() {
    return serverTimestamp();
  },

  addWeight(uid: string, peso: number) {
    return addDoc(userCollection(uid, "peso"), { peso, timestamp: serverTimestamp() });
  },

  addHabit(uid: string, payload: Record<string, unknown>) {
    return addDoc(userCollection(uid, "habitos"), payload);
  },

  archiveHabit(uid: string, habitId: string) {
    return updateDoc(userDocument(uid, "habitos", habitId), {
      activo: false,
      archivedAt: serverTimestamp()
    });
  }
};
