"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChefHat, Clock, Drumstick, Flame, Star, Utensils, Wheat } from 'lucide-react';
import PremiumLock from '../ui/PremiumLock';
import useRecetasIA from '@/app/hooks/useRecetasIA';
import { useRefrigerador } from '@/app/hooks/useRefrigerador';

export default function RecetasTab({
  isPro,
  pesoUsuario = 75,
  user,
  registrarAlimento,
  registrarComidaPet
}: any) {
  const {
    generarRecetas,
    generarPlanDiario,
    toggleRecetaFavorita,
    registrarCocinada,
    recetasFavoritas
  } = useRecetasIA();

  const { consumirIngrediente, inventario } = useRefrigerador(user?.uid);

  const [objetivo, setObjetivo] = useState('anti-cortisol');
  const [tiempoMax, setTiempoMax] = useState(45);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<string[]>([]);
  const [recetasGeneradas, setRecetasGeneradas] = useState<any[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<any>(null);
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'detalle' | 'plan'>('lista');
  const [recetaFeedback, setRecetaFeedback] = useState<string | null>(null);

  const objetivos = [
    { id: 'anti-cortisol', label: 'Anti-Cortisol' },
    { id: 'ganancia-muscular', label: 'Ganancia Muscular' },
    { id: 'perdida-grasa', label: 'Perdida de Grasa' },
    { id: 'energia', label: 'Maxima Energia' }
  ];

  const ingredientesComunes = [
    'pollo-pecho',
    'salmon',
    'huevo',
    'atun',
    'brocoli',
    'espinaca',
    'zanahoria',
    'arroz-integral',
    'avena',
    'platano',
    'almendras',
    'aguacate'
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

  const verPlanDiario = () => {
    try {
      const plan = generarPlanDiario(objetivo, ingredientesSeleccionados, pesoUsuario);
      setRecetaSeleccionada(plan);
      setVistaActiva('plan');
    } catch {
      setRecetaFeedback('No hay suficientes recetas para armar plan diario.');
      setTimeout(() => setRecetaFeedback(null), 2200);
    }
  };

  const tieneIngredientes = (receta: any) => {
    return (receta?.ingredientes || []).every((ing: any) =>
      inventario.find(
        (item) =>
          item.nombre.toLowerCase().includes((ing.nombre || '').toLowerCase()) &&
          item.cantidad >= (Number(ing.cantidad) || 0)
      )
    );
  };

  const hacerReceta = (receta: any) => {
    (receta?.ingredientes || []).forEach((ing: any) => {
      consumirIngrediente(ing.nombre, Number(ing.cantidad) || 0, ing.unidad || '');
    });

    if (registrarAlimento) {
      registrarAlimento({
        id: `${receta.id}-${Date.now()}`,
        alimentoId: receta.id,
        nombre: receta.nombre,
        tipo: 'almuerzo',
        cantidad: 1,
        unidad: 'porcion',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        caloriasTotales: receta?.macros?.calorias || 0,
        nutrientes: {
          id: receta.id,
          nombre: receta.nombre,
          calorias: receta?.macros?.calorias || 0,
          proteina: receta?.macros?.proteina || 0,
          carbohidratos: receta?.macros?.carbohidratos || 0,
          grasas: receta?.macros?.grasas || 0,
          fibra: 0,
          vitaminas: {},
          minerales: {}
        },
        impactoBateria: Math.round((receta?.macros?.calorias || 0) / 20)
      });
    }

    registrarComidaPet?.(true, receta?.macros?.calorias || 0);
    registrarCocinada(receta.id);
    setRecetaFeedback('Receta hecha. Ingredientes consumidos del refri.');
    setTimeout(() => setRecetaFeedback(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-[34px] border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-purple-900 dark:text-purple-200">
            <ChefHat size={28} /> Recetas IA
          </h2>
          <p className="mt-2 text-sm text-purple-700 dark:text-purple-300">Recetas segun objetivo, tiempo e ingredientes.</p>
        </div>
        <BookOpen className="text-purple-600 dark:text-purple-400" size={36} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {objetivos.map((obj) => (
            <button
              key={obj.id}
              onClick={() => setObjetivo(obj.id)}
              className={`rounded-[20px] border p-3 text-left text-sm font-black transition-all ${
                objetivo === obj.id
                  ? 'border-purple-600 bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Tiempo maximo: {tiempoMax} min</label>
          <input type="range" min="5" max="120" value={tiempoMax} onChange={(e) => setTiempoMax(Number(e.target.value))} className="mt-2 w-full" />
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredientesComunes.map((ing) => (
              <button
                key={ing}
                onClick={() => {
                  setIngredientesSeleccionados((prev) =>
                    prev.includes(ing) ? prev.filter((item) => item !== ing) : [...prev, ing]
                  );
                }}
                className={`rounded-full px-3 py-1 text-[9px] font-bold ${
                  ingredientesSeleccionados.includes(ing)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {ing.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={generarRecetasIA} className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-black text-white">
            Generar Recetas
          </button>
          <button onClick={verPlanDiario} className="rounded-2xl bg-gray-100 py-3 font-black text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            Plan Diario
          </button>
        </div>
      </div>

      {recetaFeedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          {recetaFeedback}
        </motion.div>
      )}

      {vistaActiva === 'lista' && recetasGeneradas.length > 0 && (
        <PremiumLock isPro={isPro} text="Recetas IA Avanzadas PRO">
          <div className="space-y-3">
            {recetasGeneradas.map((receta, idx) => (
              <motion.button
                key={receta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => {
                  setRecetaSeleccionada(receta);
                  setVistaActiva('detalle');
                }}
                className="w-full rounded-[30px] border border-gray-100 bg-white p-5 text-left transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
              >
                {tieneIngredientes(receta) && (
                  <span className="mb-2 inline-flex rounded-full bg-green-500 px-3 py-1 text-[9px] font-black text-white">? Tienes todo</span>
                )}
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{receta.nombre}</h3>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">{receta.descripcion}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRecetaFavorita(receta.id);
                    }}
                  >
                    <Star size={20} className={recetasFavoritas.includes(receta.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-[9px] font-bold text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><Clock size={13} /> {receta.tiempoTotal} min</span>
                  <span className="flex items-center gap-1"><Flame size={13} /> {receta.macros.calorias} kcal</span>
                  <span className="flex items-center gap-1"><Drumstick size={13} /> {receta.macros.proteina}g</span>
                </div>
              </motion.button>
            ))}
          </div>
        </PremiumLock>
      )}

      {vistaActiva === 'detalle' && recetaSeleccionada && !recetaSeleccionada.desayuno && (
        <div className="space-y-4">
          <button onClick={() => setVistaActiva('lista')} className="text-sm font-bold text-purple-600 dark:text-purple-400">? Volver</button>

          <div className="rounded-[30px] border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{recetaSeleccionada.nombre}</h3>
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{recetaSeleccionada.descripcion}</p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Metric icon={<Clock size={18} />} value={`${recetaSeleccionada.tiempoTotal} min`} />
              <Metric icon={<Flame size={18} />} value={`${recetaSeleccionada.macros.calorias} kcal`} />
              <Metric icon={<Drumstick size={18} />} value={`${recetaSeleccionada.macros.proteina} g`} />
              <Metric icon={<Wheat size={18} />} value={`${recetaSeleccionada.macros.carbohidratos} g`} />
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">Ingredientes</p>
            <div className="space-y-2">
              {recetaSeleccionada.ingredientes.map((ing: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-2 dark:bg-gray-700">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{ing.nombre}</span>
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-[10px] font-black text-gray-700 dark:bg-gray-600 dark:text-gray-200">{ing.cantidad} {ing.unidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-3 text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">Pasos</p>
            <div className="space-y-2">
              {recetaSeleccionada.pasos.map((paso: any) => (
                <div key={paso.numero} className="rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{paso.numero}. {paso.instruccion}</p>
                  <p className="mt-1 text-[9px] text-gray-600 dark:text-gray-400">{paso.duracion} min</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => hacerReceta(recetaSeleccionada)} className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 font-black text-white">
            ? Hacer Receta
          </button>
        </div>
      )}

      {vistaActiva === 'plan' && recetaSeleccionada?.desayuno && (
        <PremiumLock isPro={isPro} text="Plan Diario Personalizado PRO">
          <div className="space-y-4">
            <button onClick={() => setVistaActiva('lista')} className="text-sm font-bold text-purple-600 dark:text-purple-400">? Volver</button>
            <div className="rounded-[30px] border border-purple-200 bg-purple-50 p-6 dark:border-purple-700 dark:bg-purple-900/20">
              <p className="mb-2 text-sm font-black text-purple-900 dark:text-purple-200">{recetaSeleccionada.consejo}</p>
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                Total: {recetaSeleccionada.macrosTotales.calorias} kcal / {recetaSeleccionada.macrosTotales.proteina}g P
              </p>
            </div>
            {['desayuno', 'almuerzo', 'cena'].map((comida) => (
              <div key={comida} className="rounded-[28px] border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">{comida}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{recetaSeleccionada[comida].nombre}</p>
                <button
                  onClick={() => {
                    setRecetaSeleccionada(recetaSeleccionada[comida]);
                    setVistaActiva('detalle');
                  }}
                  className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400"
                >
                  Ver receta completa ?
                </button>
              </div>
            ))}
          </div>
        </PremiumLock>
      )}

      {vistaActiva === 'lista' && recetasGeneradas.length === 0 && (
        <div className="py-16 text-center opacity-50">
          <Utensils size={44} className="mx-auto mb-3 text-gray-400" />
          <p className="text-[10px] font-black uppercase text-gray-400">Genera recetas para comenzar</p>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="rounded-[16px] bg-gray-50 p-2 dark:bg-gray-700">
      <div className="mb-1 flex justify-center text-gray-500 dark:text-gray-300">{icon}</div>
      <p className="text-[9px] font-bold text-gray-700 dark:text-gray-200">{value}</p>
    </div>
  );
}
