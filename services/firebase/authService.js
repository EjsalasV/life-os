import { doc, onSnapshot, setDoc, runTransaction, writeBatch } from "firebase/firestore";
import { db } from "./client";

export function subscribeUserProfile(uid, onValue, onError) {
  return onSnapshot(doc(db, "users", uid), onValue, onError);
}

export function createUserProfile(uid, profile, updateName = true) {
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (tx) => {
    const current = await tx.get(ref);
    if (!current.exists()) tx.set(ref, profile);
    else if (updateName) tx.update(ref, { name: profile.name });
  });
}

export function completePhysicalProfile(uid, payload) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid), { physicalProfile: payload, hasCompletedOnboarding: true, onboardingDate: new Date().toISOString() }, { merge: true });
  batch.set(doc(db, "users", uid, "perfilFisico", "config"), payload, { merge: true });
  return batch.commit();
}
