import {
  DocumentData, DocumentReference, QueryDocumentSnapshot, QuerySnapshot,
  collection, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where
} from "firebase/firestore";
import { db } from "./client";

export const firestoreTimestamp = serverTimestamp;

export function subscribeDocument<T extends DocumentData>(
  reference: DocumentReference,
  onValue: (exists: boolean, data?: T) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    reference,
    (snapshot) => onValue(snapshot.exists(), snapshot.data() as T | undefined),
    onError
  );
}

export function subscribeOrderedCollection<T extends DocumentData>(
  reference: ReturnType<typeof collection>,
  field: string,
  direction: "asc" | "desc",
  onValue: (items: Array<T & { id: string }>) => void
) {
  return onSnapshot(query(reference, orderBy(field, direction)), (snapshot) => {
    onValue(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T & { id: string })));
  });
}

export function setDocument(reference: DocumentReference, data: DocumentData, merge = false) {
  return merge ? setDoc(reference, data, { merge: true }) : setDoc(reference, data);
}

export function updateDocument(reference: DocumentReference, data: DocumentData) {
  return updateDoc(reference, data);
}

export const userDocument = (uid: string, ...segments: string[]) => doc(db, "users", uid, ...segments);

export async function readDocument(reference: DocumentReference) {
  return getDoc(reference);
}

export async function readMatching(
  uid: string,
  collectionName: string,
  field: string,
  operator: Parameters<typeof where>[1],
  value: unknown
): Promise<QuerySnapshot<DocumentData, DocumentData>> {
  return getDocs(query(collection(db, "users", uid, collectionName), where(field, operator, value)));
}
