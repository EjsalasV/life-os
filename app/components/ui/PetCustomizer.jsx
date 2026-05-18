"use client";

import React from "react";
import PixelPet from "./PixelPet";
import {
  PET_ACCESSORY_OPTIONS,
  PET_COLOR_OPTIONS,
  PET_RARITY_OPTIONS,
  PET_TYPE_OPTIONS
} from "@/app/hooks/usePetStore";

export default function PetCustomizer({ draftPet, onChange, onAdopt }) {
  const update = (patch) => onChange({ ...draftPet, ...patch });

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
        <div className="flex justify-center">
          <PixelPet
            tipo={draftPet.tipo}
            color={draftPet.color}
            accesorios={draftPet.accesorios}
            raridad={draftPet.raridad}
            estadoEmocional="feliz"
            pixelSize={9}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-500">Nombre (máx 15)</label>
        <input
          value={draftPet.nombre}
          onChange={(e) => update({ nombre: e.target.value.slice(0, 15) })}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-500">Tipo</label>
        <div className="grid grid-cols-3 gap-2">
          {PET_TYPE_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => update({ tipo: t.id })}
              className={`py-2 rounded-xl text-[10px] font-black uppercase ${draftPet.tipo === t.id ? "bg-black text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-500">Color de ropa</label>
        <div className="flex flex-wrap gap-2">
          {PET_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => update({ color: c })}
              className={`w-8 h-8 rounded-full border-2 ${draftPet.color === c ? "border-black" : "border-white"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-500">Accesorios</label>
        <div className="grid grid-cols-2 gap-2">
          {PET_ACCESSORY_OPTIONS.map((a) => {
            const active = draftPet.accesorios.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() =>
                  update({
                    accesorios: active
                      ? draftPet.accesorios.filter((x) => x !== a.id)
                      : [...draftPet.accesorios, a.id]
                  })
                }
                className={`py-2 rounded-xl text-[10px] font-black uppercase ${active ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-500">Raridad</label>
        <div className="grid grid-cols-2 gap-2">
          {PET_RARITY_OPTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => update({ raridad: r.id })}
              className={`py-2 rounded-xl text-[10px] font-black uppercase ${draftPet.raridad === r.id ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onAdopt}
        className="w-full py-3 rounded-2xl bg-black text-white font-black uppercase text-xs"
      >
        Adoptar
      </button>
    </div>
  );
}
