"use client";

import { removeProfilePhoto, uploadProfilePhoto } from "@/services/firebase/profileService";
import { updateUserProfile } from "@/services/firebase/userProfileService";
import { userError } from "@/lib/userError";
import type { FirebaseUser } from "@/app/types";

interface ProfileActionContext {
  user: FirebaseUser | null;
  setErrorMsg: (message: string, type?: "success" | "error" | "info") => void;
}

export default function useProfileActions({ user, setErrorMsg }: ProfileActionContext) {
  const handleTogglePlan = async (): Promise<void> => {
    if (!user) return;
    try {
      const nuevoPlan = user.plan === "pro" ? "free" : "pro";
      await updateUserProfile(user.uid, { plan: nuevoPlan });
      setErrorMsg(`Plan cambiado a ${nuevoPlan.toUpperCase()} 🔄`);
    } catch {
      setErrorMsg("Error al cambiar plan", "error");
    }
  };

  const handleUpdateName = async (nuevoNombre: string): Promise<void> => {
    const nombre = String(nuevoNombre || "").trim();
    if (!user || !nombre) throw new Error("Escribe un nombre para continuar.");
    if (nombre.length > 100) throw new Error("El nombre no puede superar 100 caracteres.");
    try {
      await updateUserProfile(user.uid, { name: nombre });
      setErrorMsg("Nombre actualizado ✅");
    } catch (error) {
      setErrorMsg(userError(error), "error");
      throw error;
    }
  };

  const handleUploadProfilePhoto = async (file: File): Promise<void> => {
    if (!user) return;
    try {
      await uploadProfilePhoto(user.uid, file, (user as FirebaseUser & { photoPath?: string }).photoPath);
      setErrorMsg("Foto de perfil actualizada ✅");
    } catch (error) {
      setErrorMsg(userError(error), "error");
      throw error;
    }
  };

  const handleRemoveProfilePhoto = async (): Promise<void> => {
    if (!user) return;
    try {
      await removeProfilePhoto(user.uid, (user as FirebaseUser & { photoPath?: string }).photoPath);
      setErrorMsg("Foto de perfil eliminada ✅");
    } catch (error) {
      setErrorMsg(userError(error), "error");
      throw error;
    }
  };

  const handleUpdateFocus = async (enfoque: string): Promise<void> => {
    if (!user || !enfoque) return;
    try {
      await updateUserProfile(user.uid, { onboardingFocus: enfoque });
      setErrorMsg("Enfoque actualizado ✅");
    } catch (error) {
      setErrorMsg(userError(error), "error");
    }
  };

  return { handleTogglePlan, handleUpdateName, handleUpdateFocus, handleUploadProfilePhoto, handleRemoveProfilePhoto };
}
