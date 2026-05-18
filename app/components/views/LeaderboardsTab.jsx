"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_DATA = {
  usuarios: [
    { id: 1, nombre: 'FitAlpha', nivelPet: 25, experiencia: 5000 },
    { id: 2, nombre: 'NutriNova', nivelPet: 23, experiencia: 4700 },
    { id: 3, nombre: 'CortisolZero', nivelPet: 22, experiencia: 4550 },
    { id: 4, nombre: 'BioStrong', nivelPet: 21, experiencia: 4300 }
  ],
  pets: [
    { id: 1, nombre: 'Drako', tipo: 'dragon', nivel: 30, user: 'FitAlpha' },
    { id: 2, nombre: 'Michi-X', tipo: 'gato', nivel: 28, user: 'NutriNova' },
    { id: 3, nombre: 'RoboZen', tipo: 'robot', nivel: 27, user: 'BioStrong' }
  ],
  habitos: [
    { id: 1, usuario: 'FitAlpha', totalCompletados: 150, semanaActual: 7 },
    { id: 2, usuario: 'NutriNova', totalCompletados: 138, semanaActual: 6 },
    { id: 3, usuario: 'CortisolZero', totalCompletados: 129, semanaActual: 6 }
  ],
  recetas: [
    { id: 1, titulo: 'Pasta Carbonara Fit', compartidas: 45, usuario: 'FitAlpha' },
    { id: 2, titulo: 'Bowl anti estres', compartidas: 38, usuario: 'NutriNova' },
    { id: 3, titulo: 'Pollo energetico', compartidas: 33, usuario: 'BioStrong' }
  ]
};

function medal(idx) {
  if (idx === 0) return '??';
  if (idx === 1) return '??';
  if (idx === 2) return '??';
  return `#${idx + 1}`;
}

const PET_EMOJI = {
  gato: '??',
  perro: '??',
  dragon: '??',
  robot: '??',
  alienigena: '??'
};

export default function LeaderboardsTab() {
  const [categoria, setCategoria] = useState('usuarios');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'usuarios', label: '?? Usuarios' },
          { id: 'pets', label: '?? Pets' },
          { id: 'habitos', label: '? Habitos' },
          { id: 'recetas', label: '????? Recetas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoria(tab.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-[10px] font-bold transition-all ${
              categoria === tab.id
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {categoria === 'usuarios' && (
        <RankingList
          data={MOCK_DATA.usuarios}
          renderMain={(item) => (
            <>
              <p className="font-black text-gray-900 dark:text-white">{item.nombre}</p>
              <p className="text-[9px] text-gray-500">Nivel {item.nivelPet}</p>
            </>
          )}
          renderScore={(item) => <p className="text-lg font-black text-blue-600">{item.experiencia} exp</p>}
        />
      )}

      {categoria === 'pets' && (
        <RankingList
          data={MOCK_DATA.pets}
          renderMain={(item) => (
            <>
              <p className="font-black text-gray-900 dark:text-white">
                {PET_EMOJI[item.tipo] || '??'} {item.nombre}
              </p>
              <p className="text-[9px] text-gray-500">de {item.user}</p>
            </>
          )}
          renderScore={(item) => <p className="text-lg font-black text-purple-600">Niv. {item.nivel}</p>}
        />
      )}

      {categoria === 'habitos' && (
        <RankingList
          data={MOCK_DATA.habitos}
          renderMain={(item) => (
            <>
              <p className="font-black text-gray-900 dark:text-white">{item.usuario}</p>
              <p className="text-[9px] text-gray-500">Semana: {item.semanaActual}/7</p>
            </>
          )}
          renderScore={(item) => <p className="text-lg font-black text-green-600">{item.totalCompletados}</p>}
        />
      )}

      {categoria === 'recetas' && (
        <RankingList
          data={MOCK_DATA.recetas}
          renderMain={(item) => (
            <>
              <p className="font-black text-gray-900 dark:text-white">{item.titulo}</p>
              <p className="text-[9px] text-gray-500">por {item.usuario}</p>
            </>
          )}
          renderScore={(item) => <p className="text-lg font-black text-orange-600">? {item.compartidas}</p>}
        />
      )}
    </div>
  );
}

function RankingList({ data, renderMain, renderScore }) {
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between rounded-[28px] border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{medal(idx)}</span>
            <div>{renderMain(item)}</div>
          </div>
          {renderScore(item)}
        </motion.div>
      ))}
    </div>
  );
}