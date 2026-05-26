"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Settings,
  Heart,
  Smile,
  Droplets,
  UtensilsCrossed,
  Star,
  Trophy,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
} from "lucide-react";
import { playSound } from "@/app/utils/petSounds";
import { getPetMessage, getInteractionMessage } from "@/app/utils/petMessages";
import { checkAchievements, getNextMilestone } from "@/app/utils/petAchievements";
import { useRoomState } from "@/app/hooks/useRoomState";
import PetRoomStage from "./PetRoomStage";

const RARIDAD_STYLE = {
  comun: { label: "Comun", bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-600 dark:text-gray-300" },
  raro: { label: "Raro", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  epico: { label: "Epico", bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
  legendario: { label: "Legendario", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
};

const PET_OPTIONS = [
  { tipo: "gatoNaranja", label: "Cat Naranja", tag: "CAT", accent: "from-orange-400 to-orange-600" },
  { tipo: "gatoGris", label: "Cat Gris", tag: "CAT", accent: "from-slate-400 to-slate-600" },
  { tipo: "gatoBlanco", label: "Cat Blanco", tag: "CAT", accent: "from-violet-300 to-slate-300" },
  { tipo: "conejo", label: "Bunny", tag: "BUN", accent: "from-emerald-300 to-lime-500" },
];

const PET_VISUALS = {
  gatoNaranja: {
    sky: "linear-gradient(180deg, #fff2d8 0%, #ffe6bf 55%, #f7d7a1 100%)",
    pixel: "rgba(251, 146, 60, 0.14)",
    floor: "#c97332",
    floorShade: "rgba(124, 45, 18, 0.18)",
  },
  gatoGris: {
    sky: "linear-gradient(180deg, #eef2ff 0%, #e2e8f0 55%, #d6deea 100%)",
    pixel: "rgba(100, 116, 139, 0.14)",
    floor: "#64748b",
    floorShade: "rgba(51, 65, 85, 0.20)",
  },
  gatoBlanco: {
    sky: "linear-gradient(180deg, #ffffff 0%, #f5f3ff 60%, #ebe9fe 100%)",
    pixel: "rgba(196, 181, 253, 0.16)",
    floor: "#a78bfa",
    floorShade: "rgba(109, 40, 217, 0.18)",
  },
  conejo: {
    sky: "linear-gradient(180deg, #effdf5 0%, #dcfce7 58%, #bbf7d0 100%)",
    pixel: "rgba(34, 197, 94, 0.12)",
    floor: "#65a30d",
    floorShade: "rgba(63, 98, 18, 0.20)",
  },
};

const MOOD_BADGES = {
  muerto: { label: "Descansando", tone: "bg-slate-700/90 text-white" },
  triste: { label: "Necesita mimos", tone: "bg-blue-600/90 text-white" },
  normal: { label: "Tranquilo", tone: "bg-white/85 text-slate-700" },
  feliz: { label: "Feliz", tone: "bg-emerald-500/90 text-white" },
  extatico: { label: "Extatico", tone: "bg-amber-500/95 text-white" },
};

export default function VitalidadPetCard({
  pet,
  estadoEmocional,
  onChangeTipo,
  onRename,
  userHealth,
  onAcariciar,
  onJugar,
  dailyStats,
  onUpdateStats, // Callback para actualizar stats del pet
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [renombrando, setRenombrando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(pet.nombre);
  const [particles, setParticles] = useState([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [eventType, setEventType] = useState("idle");
  const [eventNonce, setEventNonce] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const [hintEnabled, setHintEnabled] = useState(false);
  const prevHungerRef = useRef(pet.hambre || 0);
  const { items, editorOpen, setEditorOpen, moveItem, setItemTint, triggerFoodOnPlate } = useRoomState(pet.id);

  // Calcular estado emocional automático basado en stats críticos
  const computedEstadoEmocional = useMemo(() => {
    // Si salud está muy baja, mostrar triste
    if (pet.salud < 40) return "triste";
    // Si está muy bien de todo, mostrar extático
    if (pet.felicidad > 85 && pet.energia > 70 && (pet.hambre || 0) < 30) return "extatico";
    // Si está feliz en general
    if (pet.felicidad > 70) return "feliz";
    // Por defecto el que se pase
    return estadoEmocional;
  }, [pet.salud, pet.felicidad, pet.energia, pet.hambre, estadoEmocional]);

  const petMessage = useMemo(() => getPetMessage(pet, userHealth, dailyStats), [pet, userHealth, dailyStats]);
  const milestone = useMemo(() => getNextMilestone(pet), [pet]);
  const achievements = useMemo(() => checkAchievements(pet, userHealth, dailyStats), [pet, userHealth, dailyStats]);
  const rarStyle = RARIDAD_STYLE[pet.raridad] || RARIDAD_STYLE.comun;
  const petVisual = PET_VISUALS[pet.tipo] || PET_VISUALS.gatoNaranja;
  const moodBadge = MOOD_BADGES[computedEstadoEmocional] || MOOD_BADGES.normal;

  // Detectar si hay alertas críticas
  const criticalAlerts = useMemo(() => {
    const alerts = [];
    if (pet.salud < 40) alerts.push({ type: 'salud', emoji: '❤️' });
    if ((pet.hambre || 0) > 70) alerts.push({ type: 'hambre', emoji: '🍽️' });
    if (pet.energia < 30) alerts.push({ type: 'energia', emoji: '⚡' });
    return alerts;
  }, [pet.salud, pet.hambre, pet.energia]);

  const needSummary = pet.hambre > 70
    ? "Quiere comer"
    : pet.sed > 70
      ? "Necesita agua"
      : estadoEmocional === "extatico"
        ? "Listo para jugar"
        : estadoEmocional === "triste"
          ? "Busca compania"
          : "Se siente estable";

  // Helper para mantener valores entre 0-100
  const clamp = (value) => Math.max(0, Math.min(100, value));

  const pixelBackground = {
    backgroundImage: `
      linear-gradient(180deg, rgba(20,16,12,0.18), rgba(20,16,12,0.05)),
      linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0)),
      url("/sprites/backgrounds/pet-room.png"),
      linear-gradient(90deg, ${petVisual.pixel} 1px, transparent 1px),
      linear-gradient(${petVisual.pixel} 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 100% 100%, contain, 16px 16px, 16px 16px",
    backgroundPosition: "0 0, 0 0, center center, 0 0, 0 0",
    backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat, repeat",
    imageRendering: "pixelated",
  };

  const handleRename = () => {
    if (!nuevoNombre.trim()) return;
    onRename(nuevoNombre.trim().slice(0, 15));
    setRenombrando(false);
  };

  const spawnParticles = (type) => {
    const count = type === "star" ? 8 : 6;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: `${type}-${Date.now()}-${i}`,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 80,
        type,
      }))
    );
    setTimeout(() => setParticles([]), 900);
  };

  const handleAcariciar = useCallback(() => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 550);
    setEventType("pet");
    setEventNonce((k) => k + 1);
    playSound("pet");
    setInteractionMsg(getInteractionMessage("pet"));
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("heart");
    onAcariciar?.();
  }, [onAcariciar]);

  const handleJugar = useCallback(() => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 700);
    setEventType("play");
    setEventNonce((k) => k + 1);
    playSound("play");
    setInteractionMsg(getInteractionMessage("play"));
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("star");
    onJugar?.();
  }, [onJugar]);

  // Hábito: Tomé agua
  // Reduce sed en 25 (sed baja = mejor)
  // Aumenta salud en 3
  const handleToméAgua = useCallback(() => {
    setEventType("drink");
    setEventNonce((k) => k + 1);
    playSound("pet");
    setInteractionMsg("¡Buen trabajo tomando agua! 💧");
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("heart");

    if (onUpdateStats) {
      onUpdateStats({
        sed: clamp(pet.sed - 25),
        salud: clamp(pet.salud + 3),
      });
    }
  }, [pet.sed, pet.salud, onUpdateStats]);

  // Hábito: Registré comida
  // Reduce hambre en 25 (hambre baja = mejor)
  // Aumenta energía en 10
  // Aumenta salud en 2
  const handleRegistréComida = useCallback(() => {
    setEventType("eat");
    setEventNonce((k) => k + 1);
    playSound("play");
    setInteractionMsg("¡Excelente, comiste bien! 🍽️");
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("star");

    if (onUpdateStats) {
      onUpdateStats({
        hambre: clamp(pet.hambre - 25),
        energia: clamp(pet.energia + 10),
        salud: clamp(pet.salud + 2),
      });
    }
  }, [pet.hambre, pet.energia, pet.salud, onUpdateStats]);

  // Hábito: Hice actividad
  // Aumenta salud en 8
  // Reduce energía en 10 (la actividad gasta energía)
  // Aumenta felicidad en 10
  const handleHiceActividad = useCallback(() => {
    setEventType("play");
    setEventNonce((k) => k + 1);
    playSound("play");
    setInteractionMsg("¡Qué energía! Excelente actividad 🎮");
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("star");

    if (onUpdateStats) {
      onUpdateStats({
        salud: clamp(pet.salud + 8),
        energia: clamp(pet.energia - 10),
        felicidad: clamp(pet.felicidad + 10),
      });
    }
  }, [pet.salud, pet.energia, pet.felicidad, onUpdateStats]);

  // Hábito: Dormí bien
  // Aumenta energía en 30 (el sueño restaura energía)
  // Aumenta salud en 5 (descanso es saludable)
  const handleDormíBien = useCallback(() => {
    setEventType("sleep");
    setEventNonce((k) => k + 1);
    playSound("pet");
    setInteractionMsg("¡Dormiste bien! A descansar 😴");
    setTimeout(() => setInteractionMsg(""), 2200);
    spawnParticles("heart");

    if (onUpdateStats) {
      onUpdateStats({
        energia: clamp(pet.energia + 30),
        salud: clamp(pet.salud + 5),
      });
    }
  }, [pet.energia, pet.salud, onUpdateStats]);

  useEffect(() => {
    const prev = prevHungerRef.current;
    const next = pet.hambre || 0;
    if (next < prev - 5) {
      setEventType("eat");
      setEventNonce((k) => k + 1);
      triggerFoodOnPlate();
    }
    prevHungerRef.current = next;
  }, [pet.hambre, triggerFoodOnPlate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem("pet-tap-hint-seen");
    if (!seen) {
      setHintEnabled(true);
      setShowTapHint(true);
      const t = setTimeout(() => setShowTapHint(false), 2000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const showHintTemporarily = useCallback(() => {
    if (!hintEnabled) return;
    setShowTapHint(true);
    setTimeout(() => setShowTapHint(false), 1600);
  }, [hintEnabled]);

  const markHintAsSeen = useCallback(() => {
    if (!hintEnabled) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("pet-tap-hint-seen", "1");
    }
    setHintEnabled(false);
    setShowTapHint(false);
  }, [hintEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-transparent to-blue-50/60 dark:from-violet-900/10 dark:to-blue-900/10 pointer-events-none" />

      <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {renombrando ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                className="w-36 rounded-xl border-2 border-violet-400 bg-white px-3 py-1.5 text-lg font-black dark:bg-gray-800 dark:text-white"
                maxLength={15}
              />
              <button onClick={handleRename} className="rounded-xl bg-emerald-500 p-2 text-white hover:bg-emerald-600 transition-colors">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="truncate text-xl font-black text-gray-900 dark:text-white">{pet.nombre}</h2>
              <button
                onClick={() => setRenombrando(true)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-violet-600 dark:hover:bg-gray-700 transition-all"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${rarStyle.bg} ${rarStyle.text}`}>
            Nv {pet.nivel} · {rarStyle.label}
          </span>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowOptions((s) => !s)}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:border-violet-300 hover:text-violet-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 transition-all"
            >
              <Settings size={17} />
            </motion.button>
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 top-full z-50 mt-2 w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <p className="mb-2 px-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Cambiar mascota</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PET_OPTIONS.map((option) => (
                      <motion.button
                        key={option.tipo}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onChangeTipo(option.tipo);
                          setShowOptions(false);
                        }}
                        className={`rounded-2xl border p-2.5 text-left transition-all ${
                          pet.tipo === option.tipo
                            ? "border-violet-300 bg-violet-500 text-white shadow-md"
                            : "border-gray-200 bg-gray-50 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-violet-900/30"
                        }`}
                      >
                        <div className={`mb-2 h-2 rounded-full bg-gradient-to-r ${option.accent}`} />
                        <p className={`text-[10px] font-black uppercase tracking-wide ${pet.tipo === option.tipo ? "text-white/80" : "text-gray-400"}`}>
                          {option.tag}
                        </p>
                        <p className={`text-[11px] font-bold ${pet.tipo === option.tipo ? "text-white" : "text-gray-700 dark:text-gray-200"}`}>
                          {option.label}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={petMessage.text}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-[24px] border border-white/70 bg-white/75 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/70"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{petMessage.emoji}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${moodBadge.tone}`}>
                  {moodBadge.label}
                </span>
              </div>
              <span className="rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white dark:bg-slate-100 dark:text-slate-800">
                {needSummary}
              </span>
            </div>
            <p className="text-[13px] font-bold leading-snug text-violet-700 dark:text-violet-300">{petMessage.text}</p>
          </motion.div>
        </AnimatePresence>
        {/* Alerta de stats críticos - animación pulsante */}
        <AnimatePresence>
          {criticalAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {criticalAlerts.map((alert) => (
                <motion.div
                  key={alert.type}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold text-white ${
                    alert.type === 'salud'
                      ? 'bg-rose-500/80 backdrop-blur-sm'
                      : alert.type === 'hambre'
                        ? 'bg-orange-500/80 backdrop-blur-sm'
                        : 'bg-violet-500/80 backdrop-blur-sm'
                  }`}
                >
                  {alert.emoji} {alert.type === 'salud' ? 'Salud baja' : alert.type === 'hambre' ? 'Muy hambriento' : 'Muy cansado'}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <PetRoomStage
          pet={pet}
          estadoEmocional={computedEstadoEmocional}
          eventType={eventType}
          eventNonce={eventNonce}
          items={items}
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
          moveItem={moveItem}
          setItemTint={setItemTint}
          pixelBackground={pixelBackground}
          onPetTap={handleAcariciar}
          onPetPointerDown={() => {
            showHintTemporarily();
            markHintAsSeen();
          }}
          showTapHint={showTapHint}
          isCritical={criticalAlerts.length > 0}
        />
        <AnimatePresence>
          {interactionMsg && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              className="absolute left-1/2 top-[55%] z-50 -translate-x-1/2 -translate-y-full"
            >
              <div className="rounded-2xl border border-violet-200 bg-white px-5 py-2.5 shadow-xl dark:border-violet-700 dark:bg-gray-800">
                <p className="whitespace-nowrap text-sm font-black text-violet-700 dark:text-violet-300">{interactionMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botones de interacción directa */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAcariciar}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-3.5 text-sm font-black text-white shadow-md shadow-pink-200 transition-all hover:shadow-pink-300 dark:shadow-pink-900/40"
        >
          💕 Acariciar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleJugar}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white shadow-md shadow-violet-200 transition-all hover:shadow-violet-300 dark:shadow-violet-900/40"
        >
          ⭐ Jugar
        </motion.button>
      </div>

      {/* Botones de hábitos saludables del usuario */}
      <div className="px-5 pb-1">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Registra tus hábitos</p>
      </div>
      <div className="grid grid-cols-4 gap-2 px-5 pb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToméAgua}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-3 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
        >
          <span className="text-xl">💧</span>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 text-center">Tomé agua</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegistréComida}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-orange-50 py-3 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
        >
          <span className="text-xl">🍽️</span>
          <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 text-center">Comí bien</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHiceActividad}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-3 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
        >
          <span className="text-xl">🎮</span>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 text-center">Actividad</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDormíBien}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-3 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
        >
          <span className="text-xl">😴</span>
          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 text-center">Dormí bien</span>
        </motion.button>
      </div>

      {/* Stats movidos al HUD superior del PetRoomStage */}
      <div className="px-5 pb-2">
        <StatRow label="Felicidad" value={pet.felicidad} icon={<Smile size={14} className="text-amber-500" />} color="bg-amber-400" track="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <NeedCard label="Hambre" value={pet.hambre || 0} icon={<UtensilsCrossed size={14} />} color="orange" tip="Registra comida para alimentarme" />
        <NeedCard label="Sed" value={pet.sed || 0} icon={<Droplets size={14} />} color="blue" tip="Bebe agua para hidratarme" />
      </div>

      <div className="mx-5 mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Star size={12} className="text-violet-400" />
            Experiencia
          </div>
          <span className="text-[11px] font-black text-violet-600 dark:text-violet-300">{pet.experiencia} xp</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
            animate={{ width: `${Math.min(100, (pet.experiencia % (pet.nivel * 100)) / (pet.nivel * 100) * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {milestone && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            Nivel {milestone.nivel} · {milestone.expProgress.toFixed(0)}% completado
          </p>
        )}
      </div>

      {achievements.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => setShowDetails((s) => !s)} className="flex w-full items-center justify-between px-5 py-3 text-left">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" />
              <span className="text-[11px] font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Logros ({achievements.length})
              </span>
            </div>
            {showDetails ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-2 px-5 pb-5">
                  {achievements.map((ach) => (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.1 }}
                      title={`${ach.title}: ${ach.desc}`}
                      className="flex flex-col items-center gap-1 rounded-2xl bg-amber-50 p-2 dark:bg-amber-900/20"
                    >
                      <span className="text-2xl">{ach.emoji}</span>
                      <p className="line-clamp-2 text-center text-[8px] font-black leading-tight text-amber-700 dark:text-amber-400">{ach.title}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function StatRow({ label, value, icon, color, track }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 shrink-0 items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className={`relative h-2.5 flex-1 overflow-hidden rounded-full ${track}`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-black text-gray-600 dark:text-gray-300">{Math.round(pct)}%</span>
    </div>
  );
}

const NEED_STYLE = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700",
    text: "text-orange-600 dark:text-orange-400",
    bar: "bg-orange-400",
    track: "bg-orange-100 dark:bg-orange-900/30",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-400",
    track: "bg-blue-100 dark:bg-blue-900/30",
  },
};

function NeedCard({ label, value, icon, color, tip }) {
  const s = NEED_STYLE[color];
  const pct = Math.max(0, Math.min(100, value));
  const isHigh = pct > 70;

  return (
    <div className={`rounded-2xl border p-3 ${s.bg} ${s.border}`}>
      <div className={`mb-2 flex items-center justify-between ${s.text}`}>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-[11px] font-black">{Math.round(pct)}%</span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${s.track}`}>
        <motion.div
          className={`h-full rounded-full ${s.bar} ${isHigh ? "animate-pulse" : ""}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {isHigh && <p className={`mt-1.5 text-[9px] font-bold ${s.text} opacity-80`}>{tip}</p>}
    </div>
  );
}

