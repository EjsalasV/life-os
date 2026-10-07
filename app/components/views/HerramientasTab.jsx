"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calculator, Zap, Timer, TrendingUp, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdventureIcon } from '../ui/AdventureIcons';
import { parseLegacyFastingTimestamp } from '@/modules/health/fasting';
import DeficitCalorico from './DeficitCalorico';

function getPhysicalProfile(user) {
  if (user?.physicalProfile) return user.physicalProfile;

  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(
      localStorage.getItem(`physical-profile-${user?.uid || 'main'}`) ||
      localStorage.getItem('physical-profile-main') ||
      '{}'
    );
  } catch {
    return {};
  }
}

export default function HerramientasTab({ user, saludHoy, toggleFasting, restoreFasting, healthProfile, isPro, adventure = false, initialTab = 'ayuno' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const physicalProfile = getPhysicalProfile(user);

  return (
    <div className={adventure ? 'adventure-more-tools-view' : 'space-y-6'}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'ayuno', label: adventure ? 'AYUNO' : '⏱️ Ayuno', icon: Clock, adventureIcon: 'focus' },
          { id: 'imc', label: adventure ? 'IMC' : '📏 IMC', icon: Calculator, adventureIcon: 'progress' },
          { id: 'tdee', label: adventure ? 'TDEE' : '🔥 TDEE', icon: Zap, adventureIcon: 'energy' },
          { id: 'cronometro', label: adventure ? 'CRONÓMETRO' : '⏱️ Cronómetro', icon: Timer, adventureIcon: 'activity' },
          { id: 'deficit', label: adventure ? 'DÉFICIT' : '🔥 Déficit calórico', icon: TrendingUp, adventureIcon: 'energy' },
          { id: 'progreso', label: adventure ? 'PROGRESO' : '📈 Progreso', icon: TrendingUp, adventureIcon: 'target' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {adventure ? <><AdventureIcon type={tab.adventureIcon} size={16} color="currentColor" />{tab.label}</> : tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ayuno' && <AyunoTool user={user} saludHoy={saludHoy} toggleFasting={toggleFasting} restoreFasting={restoreFasting} />}
      {activeTab === 'imc' && <IMCTool physicalProfile={physicalProfile} />}
      {activeTab === 'tdee' && <TDEETool physicalProfile={physicalProfile} />}
      {activeTab === 'cronometro' && <CronometroTool />}
      {activeTab === 'deficit' && <DeficitCalorico saludHoy={saludHoy} isPro={isPro} usuario={healthProfile} adventure={adventure} />}
      {activeTab === 'progreso' && <ProgresoTool physicalProfile={physicalProfile} />}
    </div>
  );
}

function AyunoTool({ user, saludHoy, toggleFasting, restoreFasting }) {
  const ayunoInicio = saludHoy?.ayunoInicio || null;
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState('00:00:00');
  const migrationAttempted = useRef(false);

  useEffect(() => {
    if (migrationAttempted.current || !user?.uid || !saludHoy) return;
    migrationAttempted.current = true;
    const key = `ayuno-inicio-${user.uid}`;
    const legacyValue = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!legacyValue) return;

    const legacyTimestamp = parseLegacyFastingTimestamp(legacyValue);
    const migration = saludHoy.ayunoInicio
      ? Promise.resolve(true)
      : restoreFasting?.(legacyTimestamp);

    Promise.resolve(migration).finally(() => window.localStorage.removeItem(key));
  }, [restoreFasting, saludHoy, user?.uid]);

  useEffect(() => {
    if (!ayunoInicio) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - ayunoInicio) / 1000));
      const horas = Math.floor(diff / 3600);
      const minutos = Math.floor((diff % 3600) / 60);
      const segundos = diff % 60;
      setTiempoTranscurrido(`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [ayunoInicio]);

  const toggleAyuno = () => toggleFasting?.();

  const horas = parseInt(tiempoTranscurrido.split(':')[0] || '0', 10);
  const bonusExp = horas >= 16 ? 10 : horas >= 12 ? 5 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 text-center space-y-6">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Contador de Ayuno</p>
        <h2 className="text-6xl font-black tabular-nums text-orange-600 mb-2">{tiempoTranscurrido}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{ayunoInicio ? 'En ayuno' : 'Inicia tu ayuno'}</p>
      </div>

      {bonusExp > 0 && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
          <p className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase">⭐ +{bonusExp} exp bonus</p>
        </motion.div>
      )}

      <button onClick={toggleAyuno} className={`w-full py-4 rounded-2xl font-black text-white transition-all ${ayunoInicio ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
        {ayunoInicio ? 'Terminar Ayuno' : 'Iniciar Ayuno'}
      </button>
    </div>
  );
}

function IMCTool({ physicalProfile }) {
  const imc = physicalProfile.peso && physicalProfile.altura
    ? (physicalProfile.peso / ((physicalProfile.altura / 100) ** 2)).toFixed(1)
    : 0;

  const n = Number(imc);
  const category = n < 18.5
    ? { category: 'Bajo Peso', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
    : n < 25
      ? { category: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
      : n < 30
        ? { category: 'Sobrepeso', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' }
        : { category: 'Obeso', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };

  return (
    <div className="space-y-4">
      <div className={`${category.bg} p-8 rounded-[40px] border border-gray-200 dark:border-gray-700 text-center`}>
        <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Tu IMC</p>
        <h2 className={`text-6xl font-black mb-2 ${category.color}`}>{imc}</h2>
        <p className={`text-sm font-bold ${category.color}`}>{category.category}</p>
      </div>
    </div>
  );
}

function TDEETool({ physicalProfile }) {
  const calcularTMB = () => {
    if (!physicalProfile.peso) return 0;
    if (physicalProfile.sexo === 'hombre') {
      return 88.362 + (13.397 * physicalProfile.peso) + (4.799 * physicalProfile.altura) - (5.677 * physicalProfile.edad);
    }
    return 447.593 + (9.247 * physicalProfile.peso) + (3.098 * physicalProfile.altura) - (4.33 * physicalProfile.edad);
  };

  const factoresActividad = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, 'muy-activo': 1.9 };
  const tmb = Math.round(calcularTMB());
  const tdee = Math.round(tmb * (factoresActividad[physicalProfile.nivelActividad] || 1.55));

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[40px] border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[9px] font-black text-gray-500 uppercase mb-1">TMB</p><h3 className="text-3xl font-black text-gray-900 dark:text-white">{tmb}</h3></div>
          <div><p className="text-[9px] font-black text-gray-500 uppercase mb-1">TDEE</p><h3 className="text-3xl font-black text-orange-600">{tdee}</h3></div>
        </div>
      </div>
    </div>
  );
}

function CronometroTool() {
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => {
    let interval;
    if (corriendo) interval = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [corriendo]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 text-center space-y-6">
      <h2 className="text-6xl font-black tabular-nums text-blue-600">{formatTime(segundos)}</h2>
      <div className="flex gap-3">
        <button onClick={() => setCorriendo(!corriendo)} className={`flex-1 py-3 rounded-2xl font-black flex items-center justify-center gap-2 ${corriendo ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
          {corriendo ? <Pause size={20} /> : <Play size={20} />}
          {corriendo ? 'Pausa' : 'Iniciar'}
        </button>
        <button onClick={() => { setSegundos(0); setCorriendo(false); }} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl font-black text-gray-900 dark:text-white"><RotateCcw size={20} /></button>
      </div>
    </div>
  );
}

function ProgresoTool({ physicalProfile }) {
  const pesoActual = physicalProfile.peso || 0;
  const pesoObjetivo = physicalProfile.pesoObjetivo || pesoActual;
  const diferencia = pesoActual - pesoObjetivo;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="text-center">
        <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Tu Progreso</p>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{pesoActual}kg → {pesoObjetivo}kg</h2>
        <p className={`text-sm font-bold mt-2 ${diferencia > 0 ? 'text-red-600' : 'text-green-600'}`}>{diferencia > 0 ? `Faltan ${diferencia.toFixed(1)}kg` : 'Meta alcanzada o superada'}</p>
      </div>
    </div>
  );
}
