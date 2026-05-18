"use client";
import React, { useState } from 'react';
import {
  Plus, Trash2, Flame, Protein, Wheat, Droplet, AlertCircle, Zap,
  TrendingUp, Pill, Heart, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import { AlimentosBase } from '@/app/constants/alimentos-base';

export default function NutricionTab({
  saludHoy,
  registrarAlimento,
  removeAlimento,
  isPro,
  setModalOpen
}) {
  const [mostrarBase, setMostrarBase] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState(null);

  const macros = {
    proteina: saludHoy?.proteinaTotal || 0,
    carbohidratos: saludHoy?.carbohidratosTotal || 0,
    grasas: saludHoy?.grasasTotal || 0,
    calorias: saludHoy?.caloriasTotales || 0,
  };

  const metas = {
    proteina: 150,
    carbohidratos: 225,
    grasas: 65,
    calorias: 2000,
  };

  const porcentajes = {
    proteina: Math.round((macros.proteina / metas.proteina) * 100),
    carbohidratos: Math.round((macros.carbohidratos / metas.carbohidratos) * 100),
    grasas: Math.round((macros.grasas / metas.grasas) * 100),
    calorias: Math.round((macros.calorias / metas.calorias) * 100),
  };

  return (
    <div className="space-y-6">
      {/* CALORÍAS TOTALES - GRANDE Y VISUAL */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-8 rounded-[40px] border border-orange-200 dark:border-orange-700 shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Energía Consumida</p>
            <h2 className="text-5xl font-black text-orange-900 dark:text-orange-200 mt-2">{macros.calorias}</h2>
            <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300 mt-1">kcal / {metas.calorias} meta</p>
          </div>
          <Flame className="text-orange-600 dark:text-orange-400" size={48} />
        </div>
        <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(porcentajes.calorias, 100)}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>
        <p className="text-xs font-bold text-orange-700 dark:text-orange-300 mt-2">{porcentajes.calorias}% de meta</p>
      </div>

      {/* MACRONUTRIENTES - GRID */}
      <PremiumLock isPro={isPro} text="Análisis de Macros PRO">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Proteína', valor: macros.proteina, meta: metas.proteina, icono: Protein, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Carbos', valor: macros.carbohidratos, meta: metas.carbohidratos, icono: Wheat, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Grasas', valor: macros.grasas, meta: metas.grasas, icono: Droplet, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
          ].map(macro => {
            const IconComponent = macro.icono;
            const porcentaje = Math.round((macro.valor / macro.meta) * 100);
            return (
              <div key={macro.label} className={`${macro.bg} p-4 rounded-[28px] border border-gray-100 dark:border-gray-700`}>
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent size={20} className={macro.color} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{macro.label}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{macro.valor.toFixed(0)}</h3>
                <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400">meta: {macro.meta}g</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(porcentaje, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full bg-gradient-to-r ${macro.color === 'text-red-500' ? 'from-red-400 to-red-600' : macro.color === 'text-amber-500' ? 'from-amber-400 to-amber-600' : 'from-yellow-400 to-yellow-600'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PremiumLock>

      {/* ALERTAS NUTRICIONALES */}
      {(saludHoy?.alertasNutricionales || []).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-[28px] space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <span className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase">Alertas Nutricionales</span>
          </div>
          {saludHoy.alertasNutricionales.map((alerta, i) => (
            <p key={i} className="text-[10px] text-red-700 dark:text-red-300 font-semibold leading-relaxed">{alerta}</p>
          ))}
        </div>
      )}

      {/* ALIMENTOS REGISTRADOS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black text-gray-400 uppercase">Alimentos Registrados</h3>
          <button
            onClick={() => setMostrarBase(!mostrarBase)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            + Agregar
          </button>
        </div>

        {mostrarBase && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto space-y-2">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-3">Selecciona un alimento</p>
            {Object.entries(AlimentosBase).map(([key, alimento]) => (
              <button
                key={key}
                onClick={() => {
                  registrarAlimento({
                    id: `${key}-${Date.now()}`,
                    alimentoId: alimento.id,
                    nombre: alimento.nombre,
                    tipo: 'almuerzo',
                    cantidad: 1,
                    unidad: 'porción',
                    hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    caloriasTotales: alimento.calorias,
                    nutrientes: alimento,
                    impactoBateria: Math.round(alimento.calorias / 20)
                  });
                  setMostrarBase(false);
                }}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all flex justify-between items-center group"
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400">{alimento.calorias} kcal</p>
                </div>
                <Plus size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {(saludHoy?.alimentos || []).length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <Pill size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">Sin alimentos registrados</p>
          </div>
        ) : (
          (saludHoy?.alimentos || []).map((alimento) => (
            <motion.div
              key={alimento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 flex justify-between items-start group"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">{alimento.hora} • {alimento.caloriasTotales} kcal</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-[8px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.proteina.toFixed(0)}p
                  </span>
                  <span className="text-[8px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.carbohidratos.toFixed(0)}c
                  </span>
                  <span className="text-[8px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.grasas.toFixed(0)}g
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeAlimento(alimento.id)}
                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* VITAMINAS Y MINERALES - DETALLADO */}
      <PremiumLock isPro={isPro} text="Perfil de Vitaminas & Minerales PRO">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-4">
          <div>
            <h4 className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-3">Vitaminas Consumidas</h4>
            <div className="space-y-2">
              {Object.entries(saludHoy?.vitaminasConsumo || {}).slice(0, 5).map(([vit, val]) => (
                <div key={vit} className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{vit}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((val / 50) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 w-8">{val.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumLock>
    </div>
  );
}
