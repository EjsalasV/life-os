"use client";
import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingDown, Target, Zap, Flame, Utensils, Scale,
  Calendar, AlertCircle, CheckCircle2, ChevronDown, Plus, Minus, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import {
  calcularTMB, calcularTDEE, calcularCaloriasObjetivo,
  distribuirMacros, predecirFechaObjetivo, analizarProgreso,
  NivelesActividad, ObjetivosCalóricos, ActividadesQuemadas, calcularCaloriasQuemadas
} from '@/app/constants/deficit-calorico';

export default function DeficitCalorico({ saludHoy, isPro, usuario = {} }) {
  // Form inputs
  const [peso, setPeso] = useState(usuario.peso || 75);
  const [altura, setAltura] = useState(usuario.altura || 175);
  const [edad, setEdad] = useState(usuario.edad || 30);
  const [sexo, setSexo] = useState('hombre');
  const [nivelActividad, setNivelActividad] = useState('moderado');
  const [objetivo, setObjetivo] = useState('perdida-grasa');
  const [pesoObjetivo, setPesoObjetivo] = useState(75);

  // Actividades registradas
  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState({ tipo: 'caminata-ligera', minutos: 30 });

  // Cálculos automáticos
  const calculos = useMemo(() => {
    const tmb = calcularTMB(peso, altura, edad, sexo);
    const tdee = calcularTDEE(tmb, nivelActividad);
    const caloriasObj = calcularCaloriasObjetivo(tdee, objetivo);
    const macros = distribuirMacros(caloriasObj.calorias, objetivo, peso);
    const prediccion = predecirFechaObjetivo(peso, pesoObjetivo, caloriasObj.deficit);

    return {
      tmb: Math.round(tmb),
      tdee,
      caloriasObjetivo: caloriasObj.calorias,
      deficit: caloriasObj.deficit,
      velocidad: caloriasObj.velocidad,
      macros,
      prediccion
    };
  }, [peso, altura, edad, sexo, nivelActividad, objetivo, pesoObjetivo]);

  // Calorías quemadas hoy
  const caloriasQuemadasHoy = useMemo(() => {
    return actividades.reduce((total, act) => {
      return total + calcularCaloriasQuemadas(act.tipo, act.minutos, peso);
    }, 0);
  }, [actividades, peso]);

  // Balance calórico
  const balanceHoy = useMemo(() => {
    const consumidas = saludHoy?.calorias || 0;
    const quemadas = caloriasQuemadasHoy;
    const balance = consumidas - quemadas;
    return { consumidas, quemadas, balance, objetivo: calculos.caloriasObjetivo };
  }, [saludHoy?.calorias, caloriasQuemadasHoy, calculos.caloriasObjetivo]);

  const agregarActividad = () => {
    if (nuevaActividad.minutos > 0) {
      setActividades([...actividades, { ...nuevaActividad, id: Date.now() }]);
      setNuevaActividad({ tipo: 'caminata-ligera', minutos: 30 });
    }
  };

  const eliminarActividad = (id) => {
    setActividades(actividades.filter(a => a.id !== id));
  };

  const colorBalance =
    balanceHoy.balance < -200 ? 'text-green-600' :
    balanceHoy.balance < 100 ? 'text-blue-600' :
    balanceHoy.balance < 200 ? 'text-orange-600' :
    'text-red-600';

  const bgBalance =
    balanceHoy.balance < -200 ? 'from-green-50 to-emerald-50 dark:from-green-900/20' :
    balanceHoy.balance < 100 ? 'from-blue-50 to-cyan-50 dark:from-blue-900/20' :
    balanceHoy.balance < 200 ? 'from-orange-50 to-amber-50 dark:from-orange-900/20' :
    'from-red-50 to-pink-50 dark:from-red-900/20';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-[40px] border border-blue-200 dark:border-blue-700 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <Calculator size={28} /> Déficit Calórico Inteligente
          </h2>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Calcula TDEE, macros y predice cuándo llegarás a tu peso objetivo
          </p>
        </div>
        <Target size={40} className="text-blue-600 dark:text-blue-400" />
      </div>

      {/* FORMULARIO DE PERFIL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4"
      >
        <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Tu Perfil</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2 block">Peso (kg)</label>
            <input
              type="number"
              value={peso}
              onChange={(e) => setPeso(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[16px] font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2 block">Altura (cm)</label>
            <input
              type="number"
              value={altura}
              onChange={(e) => setAltura(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[16px] font-bold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2 block">Edad (años)</label>
            <input
              type="number"
              value={edad}
              onChange={(e) => setEdad(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[16px] font-bold text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2 block">Sexo</label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[16px] font-bold text-gray-900 dark:text-white"
            >
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-3 block">Nivel de Actividad</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(NivelesActividad).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setNivelActividad(key)}
                className={`p-3 rounded-[20px] text-left transition-all text-[9px] font-bold border ${
                  nivelActividad === key
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="font-black">{val.descripcion}</p>
                <p className="opacity-75">{val.ejemplos}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-3 block">Objetivo</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ObjetivosCalóricos).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setObjetivo(key)}
                className={`p-3 rounded-[20px] text-center transition-all text-[8px] font-bold border ${
                  objetivo === key
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="font-black capitalize">{key.replace('-', ' ')}</p>
                <p className="opacity-75">{val.velocidad}</p>
              </button>
            ))}
          </div>
        </div>

        {objetivo === 'perdida-grasa' && (
          <div>
            <label className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2 block">
              Peso Objetivo: {pesoObjetivo}kg
            </label>
            <input
              type="range"
              min={Math.max(40, peso - 50)}
              max={peso + 30}
              value={pesoObjetivo}
              onChange={(e) => setPesoObjetivo(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </motion.div>

      {/* CÁLCULOS PRINCIPALES */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-5 rounded-[28px] border border-orange-200 dark:border-orange-700"
        >
          <p className="text-[9px] font-black text-orange-700 dark:text-orange-300 uppercase mb-1">TMB</p>
          <p className="text-3xl font-black text-orange-900 dark:text-orange-200">{calculos.tmb}</p>
          <p className="text-[8px] text-orange-700 dark:text-orange-300 mt-1">Calorías en reposo</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-[28px] border border-purple-200 dark:border-purple-700"
        >
          <p className="text-[9px] font-black text-purple-700 dark:text-purple-300 uppercase mb-1">TDEE</p>
          <p className="text-3xl font-black text-purple-900 dark:text-purple-200">{calculos.tdee}</p>
          <p className="text-[8px] text-purple-700 dark:text-purple-300 mt-1">Gasto total diario</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-[28px] border border-green-200 dark:border-green-700"
        >
          <p className="text-[9px] font-black text-green-700 dark:text-green-300 uppercase mb-1">Objetivo Diario</p>
          <p className="text-3xl font-black text-green-900 dark:text-green-200">{calculos.caloriasObjetivo}</p>
          <p className="text-[8px] text-green-700 dark:text-green-300 mt-1 flex items-center gap-1">
            {calculos.deficit !== 0 && (
              <>
                {calculos.deficit > 0 ? '↓' : '↑'} {Math.abs(calculos.deficit)} kcal
              </>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-[28px] border border-blue-200 dark:border-blue-700"
        >
          <p className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase mb-1">Predicción</p>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-200">
            {Math.floor(calculos.prediccion.diasFaltantes / 7)} sem
          </p>
          <p className="text-[8px] text-blue-700 dark:text-blue-300 mt-1">
            {calculos.prediccion.fechaEstimada.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </p>
        </motion.div>
      </div>

      {/* DISTRIBUCIÓN DE MACROS */}
      <PremiumLock isPro={isPro} text="Distribución de Macros PRO">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Macros Diarios</h3>

          <div className="space-y-3">
            {/* Proteína */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Proteína</p>
                <p className="text-sm font-black text-red-900 dark:text-red-200">{calculos.macros.gramos.proteina}g</p>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculos.macros.proteina}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-red-500"
                />
              </div>
              <p className="text-[8px] text-gray-600 dark:text-gray-400 mt-1">{calculos.macros.proteina}% de calorías</p>
            </div>

            {/* Carbohidratos */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Carbohidratos</p>
                <p className="text-sm font-black text-amber-900 dark:text-amber-200">{calculos.macros.gramos.carbos}g</p>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculos.macros.carbos}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-amber-500"
                />
              </div>
              <p className="text-[8px] text-gray-600 dark:text-gray-400 mt-1">{calculos.macros.carbos}% de calorías</p>
            </div>

            {/* Grasas */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">Grasas</p>
                <p className="text-sm font-black text-yellow-900 dark:text-yellow-200">{calculos.macros.gramos.grasas}g</p>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculos.macros.grasas}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-yellow-500"
                />
              </div>
              <p className="text-[8px] text-gray-600 dark:text-gray-400 mt-1">{calculos.macros.grasas}% de calorías</p>
            </div>
          </div>
        </div>
      </PremiumLock>

      {/* REGISTRO DE ACTIVIDADES */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
          <Flame size={16} /> Actividades Quemadas Hoy
        </h3>

        {/* Agregar actividad */}
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-[24px]">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={nuevaActividad.tipo}
              onChange={(e) => setNuevaActividad({ ...nuevaActividad, tipo: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[9px] font-bold"
            >
              {Object.entries(ActividadesQuemadas).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.icono} {key.replace('-', ' ')}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={nuevaActividad.minutos}
                onChange={(e) => setNuevaActividad({ ...nuevaActividad, minutos: Number(e.target.value) })}
                placeholder="min"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[9px] font-bold"
              />
              <button
                onClick={agregarActividad}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <p className="text-[8px] text-gray-600 dark:text-gray-400">
            Quemaría ~{calcularCaloriasQuemadas(nuevaActividad.tipo, nuevaActividad.minutos, peso)} kcal
          </p>
        </div>

        {/* Actividades registradas */}
        <div className="space-y-2">
          {actividades.length === 0 ? (
            <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center py-4">Sin actividades registradas</p>
          ) : (
            actividades.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-[20px]">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {ActividadesQuemadas[act.tipo].icono} {act.tipo.replace('-', ' ')}
                  </p>
                  <p className="text-[8px] text-gray-600 dark:text-gray-400">
                    {act.minutos} min • {calcularCaloriasQuemadas(act.tipo, act.minutos, peso)} kcal
                  </p>
                </div>
                <button
                  onClick={() => eliminarActividad(act.id)}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded-lg"
                >
                  <Minus size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {actividades.length > 0 && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-[20px]">
            <p className="text-sm font-black text-orange-900 dark:text-orange-200">
              🔥 Total quemadas: {caloriasQuemadasHoy} kcal
            </p>
          </div>
        )}
      </div>

      {/* BALANCE CALÓRICO DEL DÍA */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-br ${bgBalance} p-6 rounded-[32px] border border-opacity-20`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Balance Hoy</h3>
          <BarChart3 size={24} className={colorBalance} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">Consumidas</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{balanceHoy.consumidas}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">Quemadas</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{balanceHoy.quemadas}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">Balance</p>
            <p className={`text-2xl font-black ${colorBalance}`}>
              {balanceHoy.balance > 0 ? '+' : ''}{balanceHoy.balance}
            </p>
          </div>
        </div>

        <div className="text-center text-[9px] font-bold">
          {Math.abs(balanceHoy.balance) < 50 ? (
            <p className="text-green-700 dark:text-green-300">✅ Perfecto en objetivo</p>
          ) : balanceHoy.balance < 0 ? (
            <p className={colorBalance}>
              {Math.abs(balanceHoy.balance)} kcal deficit (bueno para pérdida de grasa)
            </p>
          ) : (
            <p className={colorBalance}>
              {balanceHoy.balance} kcal superávit {objetivo === 'ganancia-muscular' ? '✅' : '⚠️'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
