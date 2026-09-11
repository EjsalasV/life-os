import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "./client";

const profilePhotoPath = (uid) => `users/${uid}/profile/avatar`;

export async function uploadProfilePhoto(uid, file, previousPath) {
  const path = profilePhotoPath(uid);
  const photoRef = ref(storage, path);
  await uploadBytes(photoRef, file, { contentType: file.type, cacheControl: "public,max-age=3600" });
  const photoURL = await getDownloadURL(photoRef);
  await setDoc(doc(db, "users", uid), { photoURL, photoPath: path }, { merge: true });

  if (previousPath && previousPath !== path) {
    await deleteObject(ref(storage, previousPath)).catch(() => {});
  }

  return { photoURL, photoPath: path };
}

export async function removeProfilePhoto(uid, photoPath) {
  const path = photoPath || profilePhotoPath(uid);
  await deleteObject(ref(storage, path)).catch((error) => {
    if (error?.code !== "storage/object-not-found") throw error;
  });
  await setDoc(doc(db, "users", uid), { photoURL: null, photoPath: null }, { merge: true });
}
