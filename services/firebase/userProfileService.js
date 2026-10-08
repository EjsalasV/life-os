import { doc, setDoc } from "firebase/firestore";
import { db } from "./client";

export function updateUserProfile(uid, payload) {
  return setDoc(doc(db, "users", uid), payload, { merge: true });
}
