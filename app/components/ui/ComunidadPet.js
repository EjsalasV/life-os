"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Activity } from 'lucide-react';
import PixelPet from './PixelPet';

export default function ComunidadPet({ pet, petVisuals, mensaje, estadoEmocional, onOpenSelector }) {
  const animacionPulso = estadoEmocional === 'extatico' || estadoEmocional === 'feliz';
  const animacionTriste = estadoEmocional === 'triste' || estadoEmocional === 'muerto';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-[35px] border-2 ${petVisuals.bgColor} ${petVisuals.bordes} relative overflow-hidden`}
    >
      {/* FONDO ANIMADO */}
      {estadoEmocional === 'extatico' && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        </>
      )}

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              Tu Mascota Digital
            </h3>
            <p className="text-lg font-black mt-1 text-gray-900 dark:text-white">{pet.nombre}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Nivel {pet.nivel} • {pet.diasSinActividad === 0 ? '✅ Activo hoy' : `Inactivo ${pet.diasSinActividad}d`}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelPet
              estadoEmocional={estadoEmocional}
              tipo={pet.tipo || "gato"}
              color={pet.color || "#3b82f6"}
              accesorios={pet.accesorios || []}
              raridad={pet.raridad || "comun"}
            />
          </div>
        </div>
        <div className="mb-4">
          <button
            onClick={onOpenSelector}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase"
          >
            Personalizar Mascota
          </button>
        </div>

        {/* MENSAJE CONTEXTUAL */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white dark:bg-gray-800 rounded-2xl mb-4 border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm font-bold text-gray-900 dark:text-white italic">"{mensaje}"</p>
        </motion.div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* SALUD */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart size={14} className="text-rose-500" />
              <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Salud</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                animate={{ width: `${pet.salud}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.salud)}%</p>
          </div>

          {/* FELICIDAD */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[14px]">😊</span>
              <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Felicidad</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                animate={{ width: `${pet.felicidad}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.felicidad)}%</p>
          </div>

          {/* ENERGÍA */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={14} className="text-amber-500" />
              <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">Energía</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                animate={{ width: `${pet.energia}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] font-black text-gray-900 dark:text-white">{Math.round(pet.energia)}%</p>
          </div>
        </div>

        {/* ACTIVIDAD DE HOY */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className={estadoEmocional === 'muerto' ? 'text-gray-400' : 'text-blue-500'} />
            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">Actividad de Hoy</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-gray-500 dark:text-gray-400">👨‍🍳 Recetas:</span>
              <span className="font-black text-gray-900 dark:text-white ml-1">{pet.actividadHoy.recetasCompartidas}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">💬 Comentarios:</span>
              <span className="font-black text-gray-900 dark:text-white ml-1">{pet.actividadHoy.comentarios}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">❤️ Likes:</span>
              <span className="font-black text-gray-900 dark:text-white ml-1">{pet.actividadHoy.likes}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">🏆 Desafíos:</span>
              <span className="font-black text-gray-900 dark:text-white ml-1">{pet.actividadHoy.desafiosCompletados}</span>
            </div>
          </div>
        </div>

        {/* ADVERTENCIAS */}
        {pet.diasSinActividad > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <p className="text-[10px] font-bold text-red-900 dark:text-red-100">
              ⚠️ {pet.diasSinActividad === 1
                ? 'Llevas 1 día sin visitarme 😢'
                : `Llevas ${pet.diasSinActividad} días sin visitarme 😭`}
            </p>
            <p className="text-[9px] text-red-700 dark:text-red-200 mt-1">Comparte una receta o comenta para hacerme feliz</p>
          </motion.div>
        )}

        {/* SUGERENCIA DE ACCIÓN */}
        {pet.energia < 30 || pet.felicidad < 30 || pet.salud < 30 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"
          >
            <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">
              💡 Acción sugerida:
            </p>
            {pet.energia < 30 && <p className="text-[9px] text-purple-700 dark:text-purple-200 mt-0.5">Vuelve más tarde y descansa</p>}
            {pet.felicidad < 30 && <p className="text-[9px] text-purple-700 dark:text-purple-200 mt-0.5">Comparte algo con la comunidad</p>}
            {pet.salud < 30 && <p className="text-[9px] text-purple-700 dark:text-purple-200 mt-0.5">Completa un desafío para mejorar</p>}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
