import type { Timestamp } from "firebase/firestore";

export interface PhysicalProfile {
  peso: number; altura: number; edad: number;
  sexo: "hombre" | "mujer";
  nivelActividad: "sedentario" | "ligero" | "moderado" | "activo" | "muy-activo";
  objetivo: "perdida-grasa" | "mantenimiento" | "ganancia-musculo";
  pesoObjetivo: number; fechaCreacion: string;
}
export interface UserStats { lastActivity: Timestamp | null; currentStreak: number; }
export interface FirebaseUser {
  uid: string; email: string; name: string; plan: "free" | "pro";
  isNew?: boolean; stats?: UserStats; createdAt?: Date; physicalProfile?: PhysicalProfile;
  onboardingFocus?: string; photoURL?: string | null; photoPath?: string | null;
  displayName?: string; nombre?: string; hasCompletedOnboarding?: boolean;
}
export interface UserWithPhysicalProfile {
  uid: string; name?: string; email?: string; plan?: "free" | "pro"; isNew?: boolean;
  hasCompletedOnboarding?: boolean; physicalProfile?: PhysicalProfile;
}
