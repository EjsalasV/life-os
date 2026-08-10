import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de servidor ${name}.`);
  return value;
}

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: requiredEnvironmentVariable("FIREBASE_ADMIN_PROJECT_ID"),
      clientEmail: requiredEnvironmentVariable("FIREBASE_ADMIN_CLIENT_EMAIL"),
      privateKey: requiredEnvironmentVariable("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n")
    })
  });
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
