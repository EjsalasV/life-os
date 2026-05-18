"use client";

import React, { useMemo, useState } from "react";
import PixelPet from "./PixelPet";
import PetCustomizer from "./PetCustomizer";
import { PET_TYPE_OPTIONS } from "@/app/hooks/usePetStore";

function makeDraft(typeId) {
  return {
    id: `pet-${Date.now()}`,
    tipo: typeId,
    nombre: typeId === "gato" ? "Michi" : typeId === "perro" ? "Firulais" : "Nova",
    color: "#3b82f6",
    accesorios: [],
    raridad: "comun",
    nivel: 1,
    stats: { salud: 80, felicidad: 90, energia: 70 }
  };
}

export default function PetSelector({ initialPet, onAdopt }) {
  const [selectedType, setSelectedType] = useState(initialPet?.tipo || "gato");
  const [draftPet, setDraftPet] = useState(initialPet || makeDraft("gato"));

  const gallery = useMemo(
    () =>
      PET_TYPE_OPTIONS.map((t) => ({
        ...t,
        preview: { tipo: t.id, color: "#3b82f6", accesorios: [], raridad: "comun" }
      })),
    []
  );

  const handleTypePick = (typeId) => {
    setSelectedType(typeId);
    setDraftPet((prev) => ({ ...prev, tipo: typeId }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {gallery.map((pet) => (
          <button
            key={pet.id}
            onClick={() => handleTypePick(pet.id)}
            className={`p-2 rounded-2xl border ${selectedType === pet.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700"}`}
          >
            <div className="scale-75 origin-top">
              <PixelPet tipo={pet.preview.tipo} color={pet.preview.color} accesorios={[]} raridad="comun" pixelSize={6} />
            </div>
            <p className="text-[10px] font-black uppercase text-center">{pet.label}</p>
          </button>
        ))}
      </div>

      <PetCustomizer
        draftPet={draftPet}
        onChange={setDraftPet}
        onAdopt={() => onAdopt(draftPet)}
      />
    </div>
  );
}
