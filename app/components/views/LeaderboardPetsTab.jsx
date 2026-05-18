"use client";

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useMultiPets } from '@/app/hooks/useMultiPets';

function scorePet(pet) {
  return pet.nivel * 1000 + pet.experiencia;
}

function emojiByTipo(tipo) {
  const map = {
    gato: '??',
    perro: '??',
    dragon: '??',
    robot: '??',
    alienigena: '??'
  };
  return map[tipo] || '??';
}

function medal(idx) {
  if (idx === 0) return '??';
  if (idx === 1) return '??';
  if (idx === 2) return '??';
  return `#${idx + 1}`;
}

export default function LeaderboardPetsTab({ user }) {
  const { pets } = useMultiPets(user?.uid);

  const sorted = [...pets].sort((a, b) => scorePet(b) - scorePet(a));

  if (sorted.length === 0) {
    return (
      <div className="py-12 text-center opacity-50">
        <Trophy size={48} className="mx-auto mb-2 text-gray-400" />
        <p className="text-[10px] font-bold uppercase text-gray-400">Adopta una mascota para ver ranking</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((pet, idx) => (
        <motion.div
          key={pet.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          className={`rounded-[28px] border p-4 ${
            idx === 0
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
              : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{medal(idx)}</span>
              <div>
                <p className="font-black text-gray-900 dark:text-white">
                  {emojiByTipo(pet.tipo)} {pet.nombre}
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">Nivel {pet.nivel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-600">{scorePet(pet)}</p>
              <p className="text-[8px] text-gray-500">pts</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${pet.experiencia % 100}%` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}