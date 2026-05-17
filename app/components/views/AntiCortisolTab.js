"use client";
import React, { useState, useMemo } from 'react';
import {
  Zap, AlertTriangle, TrendingDown, Clock, Pill, Salad, Lightbulb,
  ChevronDown, CheckCircle2, Heart, Moon, Coffee, Activity, Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import { AlimentosAntiCortisol, PatronesCortisolAlto, HorariosOptimosCortisol, RutinaAntiCortisol, SupplementosAntiCortisol } from '@/app/constants/alimentos-anti-cortisol';

export default function AntiCortisolTab({ saludHoy, isPro, historialSalud }) {
  const [seccionActiva, setSeccionActiva] = useState('diagnostico');
  const [mostrarDetalles, setMostrarDetalles] = useState(null);

  // Diagnóstico de cortisol
  const diagnosticarCortisol = useMemo(() => {
    const estrés = saludHoy?.estres || 50;
    const sueño = saludHoy?.suenoHoras || 7;
    const alerta = (saludHoy?.alertasNutricionales || []).length;
    const animo = saludHoy?.animo;
    const inflamacion = Math.abs(saludHoy?.indiceInflamatorioPromedio || 0);

    let nivel = 'normal';
    let riesgo = 0;

    if (estrés > 70) riesgo += 30;
    if (sueño < 6) riesgo += 25;
    if (alerta > 2) riesgo += 20;
    if (animo === 'mal') riesgo += 15;
    if (inflamacion > 2) riesgo += 10;

    if (riesgo > 70) nivel = 'crítico';
    else if (riesgo > 50) nivel = 'elevado';
    else if (riesgo > 30) nivel = 'moderado';

    return { nivel, riesgo, razonesElevado: {
      estrés: estrés > 70,
      sueño: sueño < 6,
      nutricion: alerta > 2,
      animo: animo === 'mal',
      inflamacion: inflamacion > 2
    }};
  }, [saludHoy]);

  const colorCortisol =
    diagnosticarCortisol.nivel === 'crítico' ? 'text-red-600' :
    diagnosticarCortisol.nivel === 'elevado' ? 'text-orange-600' :
    diagnosticarCortisol.nivel === 'moderado' ? 'text-yellow-600' :
    'text-green-600';

  const bgCortisol =
    diagnosticarCortisol.nivel === 'crítico' ? 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700' :
    diagnosticarCortisol.nivel === 'elevado' ? 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-700' :
    diagnosticarCortisol.nivel === 'moderado' ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700' :
    'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700';

  return (
    <div className="space-y-6">
      {/* DIAGNÓSTICO PRINCIPAL */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-r ${bgCortisol} p-8 rounded-[40px] border shadow-lg`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${colorCortisol}`}>
              Estado de Cortisol
            </p>
            <h2 className={`text-4xl font-black mt-2 capitalize ${colorCortisol}`}>
              {diagnosticarCortisol.nivel === 'crítico' && '🚨'}
              {diagnosticarCortisol.nivel === 'elevado' && '⚠️'}
              {diagnosticarCortisol.nivel === 'moderado' && '⚡'}
              {diagnosticarCortisol.nivel === 'normal' && '✅'}{' '}
              {diagnosticarCortisol.nivel}
            </h2>
          </div>
          <Zap size={48} className={colorCortisol} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-[24px] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Riesgo Global</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{diagnosticarCortisol.riesgo}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${diagnosticarCortisol.riesgo}%` }}
              transition={{ duration: 1 }}
              className={`h-full ${
                diagnosticarCortisol.riesgo > 70 ? 'bg-red-500' :
                diagnosticarCortisol.riesgo > 50 ? 'bg-orange-500' :
                diagnosticarCortisol.riesgo > 30 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
            />
          </div>
        </div>

        {/* Razones del riesgo */}
        <div className="space-y-2">
          {diagnosticarCortisol.razonesElevado.estrés && (
            <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-600" /> Estrés elevado
            </p>
          )}
          {diagnosticarCortisol.razonesElevado.sueño && (
            <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Moon size={16} className="text-indigo-600" /> Sueño insuficiente
            </p>
          )}
          {diagnosticarCortisol.razonesElevado.nutricion && (
            <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Salad size={16} className="text-green-600" /> Nutrición desbalanceada
            </p>
          )}
          {diagnosticarCortisol.razonesElevado.inflamacion && (
            <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Droplets size={16} className="text-red-600" /> Inflamación detectada
            </p>
          )}
        </div>
      </motion.div>

      {/* TABS DE SECCIONES */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'diagnostico', label: '🔍 Diagnóstico' },
          { id: 'alimentos', label: '🥗 Alimentos' },
          { id: 'horarios', label: '⏰ Horarios' },
          { id: 'rutina', label: '📋 Rutina' },
          { id: 'suplementos', label: '💊 Suplementos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`px-4 py-2 rounded-[20px] text-[10px] font-black uppercase transition-all ${
              seccionActiva === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DE SECCIONES */}

      {seccionActiva === 'diagnostico' && (
        <PremiumLock isPro={isPro} text="Análisis Avanzado de Cortisol PRO">
          <div className="space-y-4">
            {PatronesCortisolAlto.map((patron, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-[28px] border ${
                  patron.tipo === 'critico' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                  patron.tipo === 'alerta' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' :
                  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                }`}
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{patron.nombre}</h4>
                <p className="text-[9px] text-gray-600 dark:text-gray-400 mb-2">{patron.descripcion}</p>
                <p className="text-[9px] font-bold text-gray-800 dark:text-gray-200">{patron.accion}</p>
              </motion.div>
            ))}
          </div>
        </PremiumLock>
      )}

      {seccionActiva === 'alimentos' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-[11px] font-black text-green-700 dark:text-green-300 uppercase mb-3">✅ Come Estos (Reducen Cortisol)</h3>
            <div className="space-y-2">
              {Object.entries(AlimentosAntiCortisol)
                .filter(([_, v]) => v.impactoCortisol < 0)
                .map(([key, alimento]) => (
                  <button
                    key={key}
                    onClick={() => setMostrarDetalles(mostrarDetalles === key ? null : key)}
                    className="w-full text-left p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-[24px] hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-emerald-900 dark:text-emerald-100">{alimento.nombre}</p>
                        <p className="text-[8px] text-emerald-700 dark:text-emerald-300">{alimento.razon}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-300">Mg: {alimento.magnesio}</p>
                        <ChevronDown size={16} className={`transition-transform ${mostrarDetalles === key ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {mostrarDetalles === key && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-600 text-[8px] text-emerald-700 dark:text-emerald-300">
                        <p className="font-bold">Antioxidantes: {alimento.antioxidantes}</p>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-red-700 dark:text-red-300 uppercase mb-3">❌ Evita Estos (Suben Cortisol)</h3>
            <div className="space-y-2">
              {Object.entries(AlimentosAntiCortisol)
                .filter(([_, v]) => v.impactoCortisol > 0)
                .map(([key, alimento]) => (
                  <div key={key} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-[24px]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-red-900 dark:text-red-100">{alimento.nombre}</p>
                        <p className="text-[8px] text-red-700 dark:text-red-300">{alimento.razon}</p>
                      </div>
                      <span className="text-xs font-black text-red-700 dark:text-red-300">+{alimento.impactoCortisol}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'horarios' && (
        <div className="space-y-3">
          {Object.entries(HorariosOptimosCortisol).map(([actividad, datos]) => (
            <motion.div
              key={actividad}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700"
            >
              <button
                onClick={() => setMostrarDetalles(mostrarDetalles === actividad ? null : actividad)}
                className="w-full text-left flex justify-between items-start mb-2"
              >
                <h4 className="font-bold text-gray-900 dark:text-white capitalize">{actividad}</h4>
                <ChevronDown size={18} className={`transition-transform ${mostrarDetalles === actividad ? 'rotate-180' : ''}`} />
              </button>
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">{datos.horario}</p>

              {mostrarDetalles === actividad && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-[9px]">
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">Por qué:</p>
                    <p className="text-gray-600 dark:text-gray-400">{datos.razon}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">Beneficio:</p>
                    <p className="text-gray-600 dark:text-gray-400">{datos.beneficio}</p>
                  </div>
                  {datos.evitar && (
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-300">⚠️ Evitar:</p>
                      <p className="text-red-600 dark:text-red-400">{datos.evitar}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {seccionActiva === 'rutina' && (
        <PremiumLock isPro={isPro} text="Rutinas Personalizadas PRO">
          <div className="space-y-4">
            {Object.entries(RutinaAntiCortisol).map(([tipo, rutina]) => (
              <motion.div
                key={tipo}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700"
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{rutina.descripcion}</h4>
                <p className="text-[8px] text-gray-600 dark:text-gray-400 mb-4">{rutina.descripcion}</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {rutina.rutina.map((paso, i) => (
                    <div key={i} className="text-[9px] p-2 bg-gray-50 dark:bg-gray-700 rounded-xl flex gap-2">
                      <span className="font-black text-purple-600 dark:text-purple-400 flex-shrink-0">{paso.split(':')[0]}</span>
                      <span className="text-gray-700 dark:text-gray-300">{paso.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </PremiumLock>
      )}

      {seccionActiva === 'suplementos' && (
        <PremiumLock isPro={isPro} text="Suplementos Anti-Cortisol PRO">
          <div className="space-y-3">
            {Object.entries(SupplementosAntiCortisol).map(([suplemento, datos]) => (
              <motion.div
                key={suplemento}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-4 rounded-[28px]"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-purple-900 dark:text-purple-100 capitalize">{suplemento}</h4>
                  <span className="text-[8px] bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100 px-2 py-1 rounded-full font-bold">
                    {datos.dosis}
                  </span>
                </div>
                <div className="text-[8px] space-y-1 text-purple-800 dark:text-purple-200">
                  <p><strong>Horario:</strong> {datos.horario}</p>
                  <p><strong>Por qué:</strong> {datos.razon}</p>
                  <p className="text-purple-700 dark:text-purple-300"><strong>Resultado en:</strong> {datos.efectoSemanas}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </PremiumLock>
      )}

      {/* ADVERTENCIA FINAL */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-[28px]">
        <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
          ⚕️ <strong>Disclaimer:</strong> Este análisis es educativo. Si cortisol está elevado consistentemente, consulta endocrinólogo. Algunos suplementos pueden interferir con medicamentos.
        </p>
      </div>
    </div>
  );
}
