"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import PixelPet from './PixelPet';
import PetCustomizer from './PetCustomizer';
import { PET_TYPE_OPTIONS } from '@/app/hooks/usePetStore';

function makeDraft(typeId) {
  const nombres = {
    gato: 'Michi',
    gatoCafe: 'Mocaccino',
    gatoBlanco: 'Nieve',
    perro: 'Firulais',
    default: 'Nova'
  };
  return {
    id: `pet-${Date.now()}`,
    tipo: typeId,
    nombre: nombres[typeId] || nombres.default,
    color: '#3b82f6',
    accesorios: [],
    raridad: 'comun',
    nivel: 1,
    stats: { salud: 80, felicidad: 90, energia: 70 }
  };
}

const TIPO_CARDS = [
  { tipo: 'gato', label: '🐱 Gato', desc: 'Curioso y agil' },
  { tipo: 'gatoCafe', label: '🐱 Gato Cafe', desc: 'Misterioso y cálido' },
  { tipo: 'gatoBlanco', label: '🤍 Gato Blanco', desc: 'Elegante y gracioso' },
  { tipo: 'perro', label: '🐶 Perro', desc: 'Leal y activo' },
  { tipo: 'dragon', label: '🐉 Dragon', desc: 'Poderoso' },
  { tipo: 'robot', label: '🤖 Robot', desc: 'Preciso' },
  { tipo: 'alienigena', label: '👽 Alienigena', desc: 'Misterioso' }
];

function getTipoEmoji(tipo) {
  const map = {
    gato: '🐱',
    gatoCafe: '🐱',
    gatoBlanco: '🤍',
    perro: '🐶',
    dragon: '🐉',
    robot: '🤖',
    alienigena: '👽'
  };
  return map[tipo] || '🐱';
}

export default function PetSelector(props) {
  if (Array.isArray(props.pets)) {
    return <PetSelectorMulti {...props} />;
  }

  return <PetSelectorLegacy {...props} />;
}

function PetSelectorLegacy({ initialPet, onAdopt }) {
  const [selectedType, setSelectedType] = useState(initialPet?.tipo || 'gato');
  const [draftPet, setDraftPet] = useState(initialPet || makeDraft('gato'));

  const gallery = useMemo(
    () =>
      PET_TYPE_OPTIONS.map((t) => ({
        ...t,
        preview: { tipo: t.id, color: '#3b82f6', accesorios: [], raridad: 'comun' }
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
            className={`rounded-2xl border p-2 ${
              selectedType === pet.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="origin-top scale-75">
              <PixelPet
                tipo={pet.preview.tipo}
                color={pet.preview.color}
                accesorios={[]}
                raridad="comun"
                pixelSize={6}
              />
            </div>
            <p className="text-center text-[10px] font-black uppercase">{pet.label}</p>
          </button>
        ))}
      </div>

      <PetCustomizer draftPet={draftPet} onChange={setDraftPet} onAdopt={() => onAdopt(draftPet)} />
    </div>
  );
}

function PetSelectorMulti({ pets, petActivoId, onSelect, onAdopt, onDelete }) {
  const [showAdoptions, setShowAdoptions] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="px-2 text-[10px] font-black uppercase text-gray-400">Mis Mascotas</h3>

        {pets.length === 0 ? (
          <div className="py-4 text-center opacity-50">
            <p className="text-[9px] font-bold text-gray-400">Sin mascotas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                whileHover={{ scale: 1.03 }}
                className={`relative rounded-[20px] border p-3 ${
                  petActivoId === pet.id
                    ? 'border-blue-400 bg-blue-500 text-white shadow-lg'
                    : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <button className="w-full text-left" onClick={() => onSelect?.(pet.id)}>
                  <div className="mb-1 text-2xl">{getTipoEmoji(pet.tipo)}</div>
                  <p className="text-[10px] font-black">{pet.nombre}</p>
                  <p className="text-[8px] opacity-70">Niv. {pet.nivel}</p>
                </button>
                {onDelete && pets.length > 1 && (
                  <button
                    onClick={() => onDelete(pet.id)}
                    className="absolute right-2 top-2 text-rose-500"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAdoptions(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-black text-white"
      >
        <Plus size={18} /> Adoptar Nuevo
      </button>

      {showAdoptions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mx-4 w-full max-w-md space-y-4 rounded-[32px] bg-white p-6 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Adopta tu mascota</h2>
              <button onClick={() => setShowAdoptions(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {TIPO_CARDS.map((tipo) => (
                <button
                  key={tipo.tipo}
                  onClick={() => {
                    const nombre = window.prompt(`Nombre para tu ${tipo.label}:`, tipo.label.split(' ')[1]);
                    if (!nombre) return;
                    onAdopt?.(tipo.tipo, nombre.trim().slice(0, 15));
                    setShowAdoptions(false);
                  }}
                  className="w-full rounded-2xl bg-gray-50 p-4 text-left transition-all hover:shadow-md dark:bg-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{tipo.label}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400">{tipo.desc}</p>
                    </div>
                    <span className="text-3xl">{getTipoEmoji(tipo.tipo)}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}