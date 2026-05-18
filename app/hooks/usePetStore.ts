"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type PetType = "gato" | "perro" | "dragon" | "alienigena" | "robot";
export type PetRarity = "comun" | "raro" | "epico" | "legendario";
export type PetAccessory = "sombrero" | "gafas" | "corona" | "moño";

export interface AdoptedPet {
  id: string;
  tipo: PetType;
  nombre: string;
  color: string;
  accesorios: PetAccessory[];
  raridad: PetRarity;
  nivel: number;
  stats: {
    salud: number;
    felicidad: number;
    energia: number;
  };
}

const STORAGE_KEY = "lifeos-pet-selected-v1";

export const PET_COLOR_OPTIONS = [
  "#3b82f6",
  "#ef4444",
  "#eab308",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#94a3b8"
];

export const PET_TYPE_OPTIONS: Array<{ id: PetType; label: string }> = [
  { id: "gato", label: "Gato" },
  { id: "perro", label: "Perro" },
  { id: "dragon", label: "Dragón" },
  { id: "alienigena", label: "Alienígena" },
  { id: "robot", label: "Robot" }
];

export const PET_ACCESSORY_OPTIONS: Array<{ id: PetAccessory; label: string }> = [
  { id: "sombrero", label: "Sombrero" },
  { id: "gafas", label: "Gafas" },
  { id: "corona", label: "Corona" },
  { id: "moño", label: "Moño" }
];

export const PET_RARITY_OPTIONS: Array<{ id: PetRarity; label: string }> = [
  { id: "comun", label: "Común" },
  { id: "raro", label: "Raro" },
  { id: "epico", label: "Épico" },
  { id: "legendario", label: "Legendario" }
];

function defaultPet(): AdoptedPet {
  return {
    id: `pet-${Date.now()}`,
    tipo: "gato",
    nombre: "Michi",
    color: "#3b82f6",
    accesorios: [],
    raridad: "comun",
    nivel: 1,
    stats: { salud: 80, felicidad: 90, energia: 70 }
  };
}

export function usePetStore() {
  const [pet, setPet] = useState<AdoptedPet>(() => defaultPet());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AdoptedPet;
        setPet(parsed);
      } catch {
        setPet(defaultPet());
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
  }, [pet, loaded]);

  const adoptPet = useCallback((incoming: Partial<AdoptedPet>) => {
    setPet((prev) => ({
      ...prev,
      ...incoming,
      id: incoming.id || `pet-${Date.now()}`
    }));
  }, []);

  const toggleAccessory = useCallback((acc: PetAccessory) => {
    setPet((prev) => {
      const exists = prev.accesorios.includes(acc);
      return {
        ...prev,
        accesorios: exists ? prev.accesorios.filter((a) => a !== acc) : [...prev.accesorios, acc]
      };
    });
  }, []);

  const setPetName = useCallback((name: string) => {
    setPet((prev) => ({ ...prev, nombre: name.slice(0, 15) }));
  }, []);

  const summary = useMemo(
    () => `${pet.nombre} • ${pet.tipo} • ${pet.raridad}`,
    [pet.nombre, pet.tipo, pet.raridad]
  );

  return {
    pet,
    loaded,
    summary,
    adoptPet,
    toggleAccessory,
    setPetName,
    setPet
  };
}
