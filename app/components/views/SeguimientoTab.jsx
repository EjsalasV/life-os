"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function SeguimientoTab({ saludHoy, historialSalud }) {
  const [expandedItems, setExpandedItems] = useState([0]); // Resumen abierto por defecto

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const accordionItems = [
    {
      id: 0,
      title: '📊 Resumen Semanal',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-[var(--life-surface)] p-3">
            <span className="text-[10px] font-semibold text-[var(--life-text-muted)]">
              Calorías semana
            </span>
            <span className="text-[14px] font-black text-[var(--life-text)]">
              {saludHoy?.caloriasSemana || 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--life-surface)] p-3">
            <span className="text-[10px] font-semibold text-[var(--life-text-muted)]">
              Horas dormidas
            </span>
            <span className="text-[14px] font-black text-[var(--life-text)]">
              {saludHoy?.horasDormidas || 0}h
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--life-surface)] p-3">
            <span className="text-[10px] font-semibold text-[var(--life-text-muted)]">
              Actividades completadas
            </span>
            <span className="text-[14px] font-black text-[var(--life-text)]">
              {saludHoy?.actividadesCompletadas || 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--life-surface)] p-3">
            <span className="text-[10px] font-semibold text-[var(--life-text-muted)]">
              Promedio diario
            </span>
            <span className="text-[14px] font-black text-[var(--life-text)]">
              {Math.round((saludHoy?.caloriasSemana || 0) / 7)} cal
            </span>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: '🎯 Objetivos Activos',
      content: (
        <div className="space-y-3">
          <div className="rounded-lg bg-[var(--life-surface)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--life-text)]">
                Beber 8 vasos de agua
              </span>
              <span className="text-[11px] font-black text-[var(--life-accent)]">
                75%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--life-border-soft)]">
              <div
                className="h-full rounded-full bg-[var(--life-accent)]"
                style={{ width: '75%' }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-[var(--life-surface)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--life-text)]">
                30 min de ejercicio
              </span>
              <span className="text-[11px] font-black text-[var(--life-accent)]">
                50%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--life-border-soft)]">
              <div
                className="h-full rounded-full bg-[var(--life-accent)]"
                style={{ width: '50%' }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-[var(--life-surface)] p-3 text-[9px] text-[var(--life-text-muted)]">
            📅 Próxima revisión: domingo
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: '📈 Progreso Mensual',
      content: (
        <div className="space-y-3">
          <div className="rounded-lg bg-[var(--life-surface)] p-4">
            <p className="mb-3 text-[10px] font-semibold text-[var(--life-text-muted)]">
              Tendencias
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--life-text-muted)]">Energía</span>
                <div className="flex gap-1">
                  {[65, 70, 72, 78, 75, 80, 85].map((v, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-sm bg-[var(--life-accent)]"
                      style={{
                        height: `${(v / 100) * 24}px`,
                        opacity: 0.6 + (i / 7) * 0.4
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-[var(--life-surface)] p-3">
              <p className="text-[9px] text-[var(--life-text-muted)]">vs Mes Anterior</p>
              <p className="text-[13px] font-black text-green-500">+12%</p>
            </div>
            <div className="flex-1 rounded-lg bg-[var(--life-surface)] p-3">
              <p className="text-[9px] text-[var(--life-text-muted)]">Hitos</p>
              <p className="text-[13px] font-black text-[var(--life-text)]">3/5</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: '🔔 Alertas Importantes',
      content: (
        <div className="space-y-2">
          <div className="rounded-lg border-l-2 border-orange-500 bg-orange-50 p-3 dark:bg-orange-900/20">
            <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
              ⚠️ Hidratación baja hoy
            </p>
            <p className="mt-1 text-[9px] text-orange-600 dark:text-orange-400">
              Solo {saludHoy?.agua || 0} vasos. Intenta llegar a 8.
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
              💡 Consejo del Coach
            </p>
            <p className="mt-1 text-[9px] text-blue-600 dark:text-blue-400">
              Desayunar dentro de 1 hora para optimizar tu metabolismo.
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-green-500 bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-[10px] font-semibold text-green-700 dark:text-green-300">
              ✨ ¡Buen trabajo!
            </p>
            <p className="mt-1 text-[9px] text-green-600 dark:text-green-400">
              Hoy completaste {saludHoy?.habitosChecks?.length || 0} hábitos. Sigue así.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {accordionItems.map((item) => {
        const isExpanded = expandedItems.includes(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.id * 0.05 }}
            className="overflow-hidden rounded-2xl border border-[var(--life-border-soft)] bg-[var(--life-surface-2)] transition-all"
          >
            <button
              onClick={() => toggleExpand(item.id)}
              className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-[var(--life-surface)]"
            >
              <span className="text-[12px] font-black text-[var(--life-text)]">
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  size={18}
                  className="text-[var(--life-text-muted)]"
                />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--life-border-soft)] px-4 py-4">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
