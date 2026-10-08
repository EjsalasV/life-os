"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { firestoreTimestamp, setDocument, subscribeDocument, userDocument } from "@/services/firebase/firestoreService";
import { changeDailyHealth } from "@/modules/health/services/dailyHealthService";
import { getTodayKey } from "@/app/utils/helpers";
import { useLocalDay } from "./useLocalDay";
import { getSaludDiariaDoc } from "@/services/firebase/refs";
import { userError } from "@/lib/userError";
import type { FirebaseUser } from "@/app/types";
import { calcularCaloriasQuemadas, ActividadesQuemadas } from "@/modules/health/domain/deficitCalorico";
import { activityListSchema, physicalProfileSchema } from "@/modules/health/schemas/healthSchemas";

type Profile = z.infer<typeof physicalProfileSchema>;
interface Activity { id: string | number; tipo: keyof typeof ActividadesQuemadas; minutos: number; calorias: number }
const activityList = activityListSchema;

export default function useDeficitCalorico(user: FirebaseUser | null, initialProfile?: Partial<Profile> | null) {
  const uid = user?.uid;
  const day = useLocalDay();
  const [profile, setProfile] = useState<Profile | null>(() => {
    const parsed = physicalProfileSchema.safeParse(initialProfile);
    return parsed.success ? parsed.data : null;
  });
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!uid) return;
    return subscribeDocument(userDocument(uid, "perfilFisico", "config"), (_exists, data) => {
      const parsed = physicalProfileSchema.safeParse({ ...initialProfile, ...data });
      if (parsed.success) setProfile(parsed.data);
      else setError("Revisa los valores del perfil físico.");
      setLoading(false);
    }, (e) => { setError(userError(e)); setLoading(false); });
  }, [uid, initialProfile]);
  useEffect(() => {
    if (!uid) return;
    return subscribeDocument(getSaludDiariaDoc(uid, day), (_exists, data) => {
      const parsed = activityList.safeParse(data?.deficitCalorico?.actividades || []);
      if (!parsed.success) { setError("El registro de actividades necesita revisión."); return; }
      const next = parsed.data as Activity[];
      setActividades((prev) => JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
    }, (e) => setError(userError(e)));
  }, [uid, day]);

  const setField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    if (!profile) return;
    setProfile((current) => current ? ({ ...current, [key]: value }) : current);
    const parsed = physicalProfileSchema.shape[key].safeParse(value);
    if (!parsed.success) { setError("Revisa el valor del perfil antes de continuar."); return; }
    if (!uid || loading) return;
    setDocument(userDocument(uid, "perfilFisico", "config"), { [key]: value, lastUpdate: firestoreTimestamp() }, true)
      .then(() => setError("")).catch((e) => setError(userError(e)));
  };
  const changeActivities = async (change: (items: Activity[]) => Activity[]) => {
    if (!uid) return;
    try {
      await changeDailyHealth(uid, getTodayKey(), (current) => {
        const previous = activityList.safeParse(current.deficitCalorico?.actividades || []);
        if (!previous.success) throw new Error("El registro de actividades necesita revisión.");
        const items = change(previous.data as Activity[]);
        const burned = items.reduce((sum, item) => sum + item.calorias, 0);
        return { deficitCalorico: { ...current.deficitCalorico, actividades: items, caloriasQuemadas: burned, balance: (current.caloriasTotales || 0) - burned } };
      });
      setError("");
    } catch (e) { setError(userError(e)); }
  };
  const agregarActividad = async (tipo: keyof typeof ActividadesQuemadas, minutos: number) => {
    if (!Number.isFinite(minutos) || minutos <= 0 || minutos > 1440 || !(tipo in ActividadesQuemadas)) { setError("Revisa la actividad y su duración."); return; }
    const activity = { id: crypto.randomUUID(), tipo, minutos, calorias: calcularCaloriasQuemadas(tipo, minutos, profile?.peso || 0) };
    await changeActivities((items) => [...items, activity]);
  };
  const eliminarActividad = (id: string | number) => changeActivities((items) => items.filter((item) => item.id !== id));
  return {
    ...(profile || {}), profileReady: !!profile, actividades, loading, error, agregarActividad, eliminarActividad,
    setPeso: (v: number) => setField("peso", v), setAltura: (v: number) => setField("altura", v),
    setEdad: (v: number) => setField("edad", v), setSexo: (v: Profile["sexo"]) => setField("sexo", v),
    setNivelActividad: (v: Profile["nivelActividad"]) => setField("nivelActividad", v), setObjetivo: (v: Profile["objetivo"]) => setField("objetivo", v),
    setPesoObjetivo: (v: number) => setField("pesoObjetivo", v)
  };
}
