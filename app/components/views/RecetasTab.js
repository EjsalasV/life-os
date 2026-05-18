"use client";
import React, { useState, useMemo } from 'react';
import {
  ChefHat, Clock, Flame, Drumstick, Wheat, Heart, Check, Star, Plus, Filter,
  AlertCircle, Zap, TrendingUp, Utensils, BookOpen, Grid2X2, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import useRecetasIA from '@/app/hooks/useRecetasIA';

export default function RecetasTab({ saludHoy, isPro, setModalOpen, pesoUsuario = 75 }) {
  const {
    generarRecetas,
    sugerirRecetasPersonalizadas,
    generarInstruccionesPasoAPaso,
    analizarAlineacionConMetas,
    generarPlanDiario,
    toggleRecetaFavorita,
    registrarCocinada,
    recetasFavoritas,
    RecetasBase
  } = useRecetasIA();

  const [objetivo, setObjetivo] = useState('anti-cortisol');
  const [tiempoMax, setTiempoMax] = useState(45);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [recetasGeneradas, setRecetasGeneradas] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('lista'); // 'lista', 'detalle', 'plan-diario'
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const objetivos = [
    { id: 'anti-cortisol', label: '🧘 Anti-Cortisol', desc: 'Reduce estrés' },
    { id: 'ganancia-muscular', label: '💪 Ganancia Muscular', desc: 'Alto en proteína' },
    { id: 'perdida-grasa', label: '🔥 Pérdida de Grasa', desc: 'Balance macros' },
    { id: 'energia', label: '⚡ Máxima Energía', desc: 'Carbos altos' }
  ];

  const ingredientesComunes = [
    'pollo-pecho', 'salmon', 'huevo', 'atun',
    'brocoli', 'espinaca', 'zanahoria',
    'arroz-integral', 'avena', 'platano',
    'almendras', 'aguacate', 'arándanos'
  ];

  const generarRecetasIA = () => {
    const recetas = generarRecetas({
      objetivo,
      tiempoMaximo: tiempoMax,
      ingredientesDisponibles: ingredientesSeleccionados
    });

    setRecetasGeneradas(recetas);
    setVistaActiva('lista');
  };

  const generarPlanDiarioFull = () => {
    try {
      const plan = generarPlanDiario(objetivo, ingredientesSeleccionados, pesoUsuario);
      setRecetaSeleccionada(plan);
      setVistaActiva('plan-diario');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CON ÍCONO */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-[40px] border border-purple-200 dark:border-purple-700 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <ChefHat size={28} /> Recetas IA Inteligentes
          </h2>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
            Crea recetas personalizadas con tus ingredientes disponibles
          </p>
        </div>
        <BookOpen size={40} className="text-purple-600 dark:text-purple-400" />
      </div>

      {/* SELECTOR DE OBJETIVO Y FILTROS */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-3">¿Cuál es tu objetivo?</p>
          <div className="grid grid-cols-2 gap-2">
            {objetivos.map(obj => (
              <motion.button
                key={obj.id}
                onClick={() => setObjetivo(obj.id)}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-[24px] text-left transition-all border ${
                  objetivo === obj.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                }`}
              >
                <p className="text-sm font-black">{obj.label}</p>
                <p className="text-[9px] opacity-75">{obj.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* FILTROS AVANZADOS */}
        <motion.div
          initial={false}
          animate={{ height: mostrarFiltros ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 space-y-4 mt-2">
            <div>
              <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">
                Tiempo máximo: {tiempoMax} min
              </label>
              <input
                type="range"
                min="5"
                max="120"
                value={tiempoMax}
                onChange={(e) => setTiempoMax(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2">
                Ingredientes disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {ingredientesComunes.map(ing => (
                  <button
                    key={ing}
                    onClick={() => {
                      setIngredientesSeleccionados(prev =>
                        prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-bold transition-all ${
                      ingredientesSeleccionados.includes(ing)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {ing.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <Filter size={18} /> Filtros
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generarRecetasIA}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[20px] font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Zap size={18} /> Generar Recetas
          </motion.button>
        </div>
      </div>

      {/* VISTA: LISTA DE RECETAS */}
      {vistaActiva === 'lista' && recetasGeneradas.length > 0 && (
        <PremiumLock isPro={isPro} text="Recetas IA Avanzadas PRO">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">
                {recetasGeneradas.length} recetas encontradas
              </h3>
              <button
                onClick={generarPlanDiarioFull}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full"
              >
                📋 Plan Diario
              </button>
            </div>

            <AnimatePresence>
              {recetasGeneradas.map((receta, idx) => (
                <motion.button
                  key={receta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setRecetaSeleccionada(receta);
                    setVistaActiva('detalle');
                  }}
                  className="w-full text-left bg-white dark:bg-gray-800 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">{receta.nombre}</h3>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{receta.descripcion}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecetaFavorita(receta.id);
                      }}
                      className="transition-all"
                    >
                      <Star
                        size={20}
                        className={`transition-all ${
                          recetasFavoritas.includes(receta.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-4 mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{receta.tiempoTotal} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{receta.macros.calorias} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Drumstick size={14} className="text-red-500" />
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{receta.macros.proteina}g</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1 flex-wrap">
                      {receta.beneficios.slice(0, 2).map((beneficio, i) => (
                        <span key={i} className="text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-bold">
                          {beneficio}
                        </span>
                      ))}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black ${
                      receta.indiceInflamatorio < 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {receta.indiceInflamatorio < 0 ? '✅ Anti-inflamatorio' : '⚠️ Normal'}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </PremiumLock>
      )}

      {/* VISTA: DETALLE DE RECETA */}
      {vistaActiva === 'detalle' && recetaSeleccionada && !recetaSeleccionada.desayuno && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button
            onClick={() => setVistaActiva('lista')}
            className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-4"
          >
            ← Volver a recetas
          </button>

          {/* HEADER RECETA */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-[35px] border border-orange-200 dark:border-orange-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{recetaSeleccionada.nombre}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{recetaSeleccionada.descripcion}</p>
              </div>
              <button onClick={() => toggleRecetaFavorita(recetaSeleccionada.id)}>
                <Star
                  size={32}
                  className={`transition-all ${
                    recetasFavoritas.includes(recetaSeleccionada.id)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <Clock size={20} className="mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{recetaSeleccionada.tiempoTotal} min</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <Flame size={20} className="mx-auto mb-1 text-orange-600 dark:text-orange-400" />
                <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{recetaSeleccionada.macros.calorias} kcal</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <Drumstick size={20} className="mx-auto mb-1 text-red-600 dark:text-red-400" />
                <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{recetaSeleccionada.macros.proteina}g</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <Wheat size={20} className="mx-auto mb-1 text-amber-600 dark:text-amber-400" />
                <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{recetaSeleccionada.macros.carbohidratos}g</p>
              </div>
            </div>
          </div>

          {/* INGREDIENTES */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
              <Utensils size={16} /> Ingredientes
            </h3>
            {recetaSeleccionada.ingredientes.map((ing, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm font-bold text-gray-800 dark:text-white">{ing.nombre}</span>
                <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full">
                  {ing.cantidad} {ing.unidad}
                </span>
              </div>
            ))}
          </div>

          {/* PASOS A PASO CON TIMER */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
              <TrendingUp size={16} /> Pasos a Paso
            </h3>
            {recetaSeleccionada.pasos.map((paso, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-[24px] border border-blue-200 dark:border-blue-700"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-sm">
                    {paso.numero}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{paso.instruccion}</p>
                    <p className="text-[9px] text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {paso.duracion} minutos
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* BENEFICIOS */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-[35px] border border-emerald-200 dark:border-emerald-700 space-y-3">
            <h3 className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 uppercase">✨ Beneficios</h3>
            <div className="space-y-2">
              {recetaSeleccionada.beneficios.map((beneficio, i) => (
                <p key={i} className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Check size={16} /> {beneficio}
                </p>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => registrarCocinada(recetaSeleccionada.id)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[24px] font-black text-sm shadow-lg hover:shadow-xl transition-all"
          >
            ✅ Registrar que la Cociné
          </motion.button>
        </motion.div>
      )}

      {/* VISTA: PLAN DIARIO */}
      {vistaActiva === 'plan-diario' && recetaSeleccionada && recetaSeleccionada.desayuno && (
        <PremiumLock isPro={isPro} text="Plan Diario Personalizado PRO">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <button
              onClick={() => setVistaActiva('lista')}
              className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2"
            >
              ← Volver
            </button>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-[35px] border border-purple-200 dark:border-purple-700">
              <p className="text-lg font-black text-purple-900 dark:text-purple-200 mb-3">{recetaSeleccionada.consejo}</p>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400">Calorías</p>
                  <p className="text-lg font-black text-orange-600 dark:text-orange-400">{recetaSeleccionada.macrosTotales.calorias}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400">Proteína</p>
                  <p className="text-lg font-black text-red-600 dark:text-red-400">{recetaSeleccionada.macrosTotales.proteina}g</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400">Carbos</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">{recetaSeleccionada.macrosTotales.carbohidratos}g</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400">Grasas</p>
                  <p className="text-lg font-black text-yellow-600 dark:text-yellow-400">{recetaSeleccionada.macrosTotales.grasas}g</p>
                </div>
              </div>
            </div>

            {['desayuno', 'almuerzo', 'cena'].map(comida => (
              <div key={comida} className="bg-white dark:bg-gray-800 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-black text-gray-900 dark:text-white capitalize mb-3">
                  {comida === 'desayuno' ? '🌅' : comida === 'almuerzo' ? '🍽️' : '🌙'} {comida}
                </h3>
                <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">{recetaSeleccionada[comida].nombre}</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-[8px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-bold">
                    {recetaSeleccionada[comida].macros.calorias} kcal
                  </span>
                  <span className="text-[8px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-bold">
                    {recetaSeleccionada[comida].macros.proteina}g P
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRecetaSeleccionada(recetaSeleccionada[comida]);
                    setVistaActiva('detalle');
                  }}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Ver receta completa →
                </button>
              </div>
            ))}
          </motion.div>
        </PremiumLock>
      )}

      {/* ESTADO VACÍO */}
      {recetasGeneradas.length === 0 && vistaActiva === 'lista' && (
        <div className="text-center py-20 opacity-50">
          <Utensils size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Haz clic en "Generar Recetas" para empezar
          </p>
        </div>
      )}
    </div>
  );
}
