"use client";
import React, { useState, useEffect } from 'react';
import {
  Brain, Lightbulb, TrendingUp, AlertTriangle, Heart, Zap,
  Moon, Droplets, Apple, Dumbbell, Activity, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

export default function IACoachTab({
  saludHoy,
  predecirBateriaManana,
  historialSalud,
  analizarCompatibilidad,
  isPro,
  setModalOpen
}) {
  const [bateriaPredicha, setBateriaPredicha] = useState(null);
  const [sinergias, setSinergias] = useState([]);
  const [expandedConsejo, setExpandedConsejo] = useState(0);

  useEffect(() => {
    if (saludHoy && historialSalud) {
      const prediccion = predecirBateriaManana(historialSalud, {
        caloriasTotales: saludHoy.caloriasTotales,
        proteinaTotal: saludHoy.proteinaTotal,
        carbohidratosTotal: saludHoy.carbohidratosTotal,
        grasasTotal: saludHoy.grasasTotal,
        vitaminasConsumo: saludHoy.vitaminasConsumo || {},
        mineralesConsumo: saludHoy.mineralesConsumo || {},
        indiceInflamatorioPromedio: saludHoy.indiceInflamatorioPromedio || 0
      }, saludHoy.suenoHoras || 7);
      setBateriaPredicha(prediccion);

      const sinergiasList = analizarCompatibilidad(saludHoy.alimentos || []);
      setSinergias(sinergiasList);
    }
  }, [saludHoy, historialSalud]);

  const consejosConIconos = (saludHoy?.consejosIA || []).map(consejo => {
    if (consejo.includes('energía') || consejo.includes('bajo')) return { icono: Zap, tipo: 'energia' };
    if (consejo.includes('proteína') || consejo.includes('💪')) return { icono: Dumbbell, tipo: 'nutricion' };
    if (consejo.includes('descanso') || consejo.includes('😴')) return { icono: Moon, tipo: 'sueno' };
    if (consejo.includes('hidratación') || consejo.includes('💧')) return { icono: Droplets, tipo: 'hidratacion' };
    if (consejo.includes('estrés') || consejo.includes('🧘')) return { icono: Heart, tipo: 'estres' };
    return { icono: Lightbulb, tipo: 'general' };
  });

  return (
    <div className="space-y-6">
      {/* PREDICCIÓN DE BATERÍA PARA MAÑANA */}
      <PremiumLock isPro={isPro} text="Predictor de Energía 24h PRO">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 rounded-[40px] border border-purple-200 dark:border-purple-700 shadow-lg"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Predicción para Mañana</p>
              <h2 className="text-5xl font-black text-purple-900 dark:text-purple-200 mt-2">{bateriaPredicha || '?'}%</h2>
              <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 mt-1">
                {bateriaPredicha && bateriaPredicha > 70 ? '🔥 Día excelente esperado' :
                  bateriaPredicha && bateriaPredicha > 50 ? '✅ Día productivo' :
                    bateriaPredicha && bateriaPredicha > 30 ? '⚠️ Energía moderada' :
                      '❌ Necesitas mejorar hábitos'}
              </p>
            </div>
            <Brain className="text-purple-600 dark:text-purple-400" size={48} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-[28px] space-y-2">
            <h4 className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase">Basado en:</h4>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">Sueño: {saludHoy?.suenoHoras || '?'}h</span>
              </div>
              <div className="flex items-center gap-2">
                <Apple size={14} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Nutrición: {(saludHoy?.caloriasTotales || 0).toFixed(0)} kcal</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell size={14} className="text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Movimiento: {saludHoy?.ejercicioMinutos || 0}min</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart size={14} className="text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">Proteína: {(saludHoy?.proteinaTotal || 0).toFixed(0)}g</span>
              </div>
            </div>
          </div>
        </motion.div>
      </PremiumLock>

      {/* CONSEJOS PERSONALIZADOS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2 mb-4">
          <Lightbulb size={20} className="text-yellow-500" />
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Consejos Personalizados</h3>
        </div>

        {(saludHoy?.consejosIA || []).length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Brain size={40} className="mx-auto mb-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">Registra tus datos para obtener consejos</p>
          </div>
        ) : (
          <AnimatePresence>
            {consejosConIconos.map((item, i) => {
              const consejo = (saludHoy?.consejosIA || [])[i];
              const IconComponent = item.icono;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => setExpandedConsejo(expandedConsejo === i ? -1 : i)}
                  className="w-full text-left"
                >
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-3 rounded-2xl mt-1">
                        <IconComponent size={20} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{consejo}</p>
                        {expandedConsejo === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-[9px] text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl"
                          >
                            💡 Implementa gradualmente. Pequeños cambios consistentes generan grandes resultados.
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ANÁLISIS DE COMPATIBILIDAD NUTRICIONAL */}
      {sinergias.length > 0 && (
        <PremiumLock isPro={isPro} text="Análisis de Sinergia Nutricional PRO">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Activity size={20} className="text-emerald-500" />
              <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Sinergias Detectadas</h3>
            </div>

            {sinergias.map((sinergia, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-[28px] border border-emerald-200 dark:border-emerald-700"
              >
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 leading-relaxed">{sinergia}</p>
              </motion.div>
            ))}
          </div>
        </PremiumLock>
      )}

      {/* RESUMEN DE IMPACTO */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[40px] border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">Impacto Hoy en tu Energía</h3>

        <div className="space-y-3">
          {[
            { label: 'Calorías', impacto: (saludHoy?.caloriasTotales || 0) / 20, max: 100, color: 'bg-orange-500' },
            { label: 'Proteína', impacto: Math.min((saludHoy?.proteinaTotal || 0) * 0.7, 100), max: 100, color: 'bg-red-500' },
            { label: 'Hidratación', impacto: (saludHoy?.agua || 0) * 15, max: 100, color: 'bg-blue-500' },
            { label: 'Movimiento', impacto: Math.min((saludHoy?.ejercicioMinutos || 0) * 1.5, 100), max: 100, color: 'bg-rose-500' }
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-[9px] font-black text-gray-600 dark:text-gray-400">{Math.min(Math.round(item.impacto), 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(item.impacto, 100)}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOTA DE IA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-[28px] border border-blue-200 dark:border-blue-700">
        <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
          🤖 <strong>Nota de IA:</strong> Este análisis se basa en patrones científicos de nutrición y bienestar. Consulta a un profesional para planes personalizados específicos.
        </p>
      </div>
    </div>
  );
}
