import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./client";

export function subscribeUserProfile(uid, onValue, onError) {
  return onSnapshot(doc(db, "users", uid), onValue, onError);
}

export function createUserProfile(uid, profile) {
  return setDoc(doc(db, "users", uid), profile);
}
