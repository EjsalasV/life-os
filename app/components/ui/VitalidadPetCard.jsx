"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import { Settings, Heart, Zap, Hand, Gamepad2, Droplet, Apple } from 'lucide-react';
import PixelPetEvolution from './PixelPetEvolution';
import { playSound } from '@/app/utils/petSounds';
import { getPetMessage, getInteractionMessage } from '@/app/utils/petMessages';
import { checkAchievements, getNextMilestone } from '@/app/utils/petAchievements';

export default function VitalidadPetCard({ pet, estadoEmocional, onChangeTipo, onRename, userHealth, onAcariciar, onJugar, dailyStats }) {
  const [showOptions, setShowOptions] = useState(false);
  const [renombrando, setRenombrando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(pet.nombre);
  const [particles, setParticles] = useState([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState('');
  const [showNewAchievement, setShowNewAchievement] = useState(false);
  const [newAchievementData, setNewAchievementData] = useState(null);

  const petMessage = useMemo(() => getPetMessage(pet, userHealth, dailyStats), [pet, userHealth, dailyStats]);
  const milestone = useMemo(() => getNextMilestone(pet), [pet]);
  const achievements = useMemo(() => checkAchievements(pet, userHealth, dailyStats), [pet, userHealth, dailyStats]);

  const tiposPets = [
    { tipo: 'gato', emoji: '🐱', label: 'Gato' },
    { tipo: 'perro', emoji: '🐶', label: 'Perro' },
    { tipo: 'dragon', emoji: '🐉', label: 'Dragón' },
    { tipo: 'robot', emoji: '🤖', label: 'Robot' },
    { tipo: 'alienigena', emoji: '👽', label: 'Alienígena' }
  ];

  const handleRename = () => {
    if (!nuevoNombre.trim()) return;
    onRename(nuevoNombre);
    setRenombrando(false);
  };

  const handleAcariciar = useCallback(() => {
    setIsInteracting(true);
    playSound('pet');
    const msg = getInteractionMessage('pet');
    setInteractionMsg(msg);
    setTimeout(() => setInteractionMsg(''), 2000);
    setTimeout(() => setIsInteracting(false), 300);

    // Crear partículas de corazones
    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 50 - 25
    }));
    setParticles(newParticles);

    onAcariciar?.();
  }, [onAcariciar]);

  const handleJugar = useCallback(() => {
    setIsInteracting(true);
    playSound('play');
    const msg = getInteractionMessage('play');
    setInteractionMsg(msg);
    setTimeout(() => setInteractionMsg(''), 2000);
    setTimeout(() => setIsInteracting(false), 300);

    // Crear partículas de estrellas
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: `star-${Date.now()}-${i}`,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      type: 'star'
    }));
    setParticles(newParticles);

    onJugar?.();
  }, [onJugar]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <div className="relative overflow-visible rounded-[40px] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-lg dark:border-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30">
        <div className="absolute right-0 top-0 h-32 w-32 animate-pulse rounded-full bg-blue-300 opacity-10 blur-3xl" />

        <div className="relative z-10 mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Tu Mascota Digital</p>

            {renombrando ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  autoFocus
                  className="rounded-lg border-2 border-blue-500 bg-white px-3 py-1 text-2xl font-black dark:bg-gray-700"
                />
                <button onClick={handleRename} className="rounded-lg bg-green-500 px-4 py-1 font-black text-white">
                  ?
                </button>
              </div>
            ) : (
              <h2 className="group mt-1 flex items-center gap-2 text-3xl font-black text-gray-900 dark:text-white">
                {pet.nombre}
                <button onClick={() => setRenombrando(true)} className="text-blue-500 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-600">
                  ??
                </button>
              </h2>
            )}

            <div className="mt-2 flex gap-3">
              <p className="text-[11px] font-black text-blue-700 dark:text-blue-300">Nivel {pet.nivel}</p>
              <p className="text-[11px] font-black text-purple-700 dark:text-purple-300">{String(pet.raridad).toUpperCase()}</p>
            </div>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOptions((s) => !s)}
              className="rounded-2xl border-2 border-blue-200 bg-white p-3 shadow-lg transition-all hover:shadow-xl dark:border-blue-700 dark:bg-gray-800"
            >
              <Settings size={20} className="text-blue-600" />
            </motion.button>

            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full z-50 mt-2 min-w-max rounded-[28px] border-2 border-blue-200 bg-white p-2 shadow-xl dark:border-blue-700 dark:bg-gray-800"
              >
                <p className="px-4 py-2 text-[9px] font-black uppercase text-gray-500">Cambiar Tipo</p>
                <div className="grid grid-cols-5 gap-2 p-2">
                  {tiposPets.map((t) => (
                    <motion.button
                      key={t.tipo}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        onChangeTipo(t.tipo);
                        setShowOptions(false);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                        pet.tipo === t.tipo ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-[8px] font-bold">{t.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAcariciar}
          className="relative mb-6 flex cursor-pointer justify-center rounded-[35px] border-2 border-blue-200 bg-white p-8 shadow-inner dark:border-blue-700 dark:bg-gray-800 overflow-hidden group"
        >
          {/* Partículas de interacción */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ opacity: 0, x: p.x * 2, y: p.y * 2, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute pointer-events-none"
                style={{ left: '50%', top: '50%', marginLeft: '-12px', marginTop: '-12px' }}
              >
                <span className="text-2xl">{p.type === 'star' ? '⭐' : '❤️'}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          <PixelPetEvolution
            nivel={pet.nivel}
            estadoEmocional={estadoEmocional}
            tipo={pet.tipo}
            color={pet.color || '#3b82f6'}
            accesorios={[]}
            raridad={pet.raridad}
            peso={userHealth?.peso}
            altura={userHealth?.altura}
            pesoObjetivo={userHealth?.pesoObjetivo}
            felicidad={pet.felicidad}
            energia={pet.energia}
            salud={pet.salud}
            isInteracting={isInteracting}
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 rounded-[35px]">
            <p className="text-white font-black text-sm">👆 Acaricia tu mascota</p>
          </div>
        </motion.div>

        {/* Botones de acciones rápidas */}
        <div className="mb-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAcariciar}
            className="flex-1 flex items-center justify-center gap-2 rounded-[28px] border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-red-50 p-3 font-black text-pink-600 hover:shadow-lg transition-all dark:border-pink-700 dark:from-pink-900/30 dark:to-red-900/30 dark:text-pink-300"
          >
            <Hand size={18} />
            Acariciar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJugar}
            className="flex-1 flex items-center justify-center gap-2 rounded-[28px] border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-3 font-black text-purple-600 hover:shadow-lg transition-all dark:border-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300"
          >
            <Gamepad2 size={18} />
            Jugar
          </motion.button>
        </div>

        {/* Mensaje contextual de la mascota */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 rounded-[28px] border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30">
          <p className="text-center text-2xl mb-2">{petMessage.emoji}</p>
          <p className="text-center font-black text-blue-700 dark:text-blue-300">{petMessage.text}</p>
        </motion.div>

        {/* Mensaje de interacción flotante */}
        <AnimatePresence>
          {interactionMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-xl border-2 border-blue-200 dark:border-blue-700"
            >
              <p className="font-black text-blue-700 dark:text-blue-300">{interactionMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatBox title="Salud" value={pet.salud} border="border-red-200 dark:border-red-700" bg="bg-red-100 dark:bg-red-900/30" fill="from-red-400 to-red-600" text="text-red-600 dark:text-red-400" icon={<Heart size={16} className="text-red-500" />} />
          <StatBox title="Felicidad" value={pet.felicidad} border="border-yellow-200 dark:border-yellow-700" bg="bg-yellow-100 dark:bg-yellow-900/30" fill="from-yellow-400 to-yellow-600" text="text-yellow-600 dark:text-yellow-400" icon={<span className="text-lg">😊</span>} />
          <StatBox title="Energía" value={pet.energia} border="border-amber-200 dark:border-amber-700" bg="bg-amber-100 dark:bg-amber-900/30" fill="from-amber-400 to-amber-600" text="text-amber-600 dark:text-amber-400" icon={<Zap size={16} className="text-amber-500" />} />
        </div>

        {/* Hambre y Sed */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatBox title="Hambre" value={pet.hambre || 0} border="border-orange-200 dark:border-orange-700" bg="bg-orange-100 dark:bg-orange-900/30" fill="from-orange-400 to-orange-600" text="text-orange-600 dark:text-orange-400" icon={<Apple size={16} className="text-orange-500" />} />
          <StatBox title="Sed" value={pet.sed || 0} border="border-blue-200 dark:border-blue-700" bg="bg-blue-100 dark:bg-blue-900/30" fill="from-blue-400 to-blue-600" text="text-blue-600 dark:text-blue-400" icon={<Droplet size={16} className="text-blue-500" />} />
        </div>

        {/* Experiencia */}
        <motion.div whileHover={{ scale: 1.02 }} className="mb-6 rounded-[28px] border-2 border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-4 dark:border-purple-700 dark:from-purple-900/30 dark:to-pink-900/30">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300">Experiencia</p>
            <p className="text-sm font-black text-purple-700 dark:text-purple-300">{pet.experiencia} / {pet.nivel * 100}</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900/50">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500" animate={{ width: `${(pet.experiencia % 100)}%` }} transition={{ duration: 0.5 }} />
          </div>
          {milestone && (
            <div className="mt-3 text-center">
              <p className="text-[9px] font-black text-purple-600 dark:text-purple-300">Próximo hito: Nivel {milestone.nivel}</p>
              <p className="text-[8px] text-purple-500">{milestone.expProgress.toFixed(0)}% de progreso</p>
            </div>
          )}
        </motion.div>

        {/* Logros */}
        {achievements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30">
            <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 mb-3">Logros Conseguidos</p>
            <div className="grid grid-cols-5 gap-2">
              {achievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  whileHover={{ scale: 1.1 }}
                  title={ach.title}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/50 p-2 dark:bg-gray-800/50"
                >
                  <span className="text-2xl">{ach.emoji}</span>
                  <p className="text-[8px] font-black text-amber-700 dark:text-amber-300 text-center line-clamp-1">{ach.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function StatBox({ title, value, border, bg, fill, text, icon }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className={`rounded-[28px] border-2 bg-white p-4 transition-all hover:shadow-lg dark:bg-gray-800 ${border}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black uppercase text-gray-600 dark:text-gray-400">{title}</span>
      </div>
      <div className={`mb-1.5 h-2 w-full overflow-hidden rounded-full ${bg}`}>
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${fill}`} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ duration: 0.5 }} />
      </div>
      <p className={`text-[11px] font-black ${text}`}>{Math.round(value)}%</p>
    </motion.div>
  );
}

