import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export default function PresupuestosAlertasPanel({
  presupuestoData,
  formatMoney
}) {
  // Filtrar presupuestos con alertas activas
  const presupuestosConAlerta = presupuestoData.filter(p => p.porcentaje >= 50);

  if (presupuestosConAlerta.length === 0) {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[25px] border border-emerald-200 dark:border-emerald-800 text-center">
        <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
        <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
          Todos los presupuestos bajo control ✅
        </p>
      </div>
    );
  }

  const getEstadoInfo = (porcentaje) => {
    if (porcentaje >= 100) return { emoji: '🚨', label: 'EXCEDIDO', color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800', textColor: 'text-rose-700 dark:text-rose-300' };
    if (porcentaje >= 90) return { emoji: '🔴', label: 'CRÍTICO', color: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800', textColor: 'text-red-700 dark:text-red-300' };
    if (porcentaje >= 80) return { emoji: '🟠', label: 'CERCANO', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', textColor: 'text-amber-700 dark:text-amber-300' };
    if (porcentaje >= 70) return { emoji: '🟡', label: 'ELEVADO', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-700 dark:text-yellow-300' };
    if (porcentaje >= 50) return { emoji: '⚪', label: 'MODERADO', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', textColor: 'text-blue-700 dark:text-blue-300' };
    return { emoji: '✅', label: 'SEGURO', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-700 dark:text-emerald-300' };
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 px-1 flex items-center gap-1">
        <AlertTriangle size={12} /> Alertas Activas
      </p>

      <div className="grid gap-2">
        {presupuestosConAlerta.sort((a, b) => b.porcentaje - a.porcentaje).map((presupuesto) => {
          const info = getEstadoInfo(presupuesto.porcentaje);

          return (
            <div key={presupuesto.id} className={`p-3 rounded-lg border ${info.color}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.emoji}</span>
                  <div>
                    <p className={`text-xs font-black uppercase ${info.textColor}`}>{info.label}</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{presupuesto.label}</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-full ${info.color} ${info.textColor}`}>
                  {presupuesto.porcentaje}%
                </span>
              </div>

              <div className="text-[9px] font-bold text-gray-600 dark:text-gray-400 space-y-0.5">
                <p>Gastado: {formatMoney(presupuesto.gastado)} / {formatMoney(presupuesto.limite)}</p>
                {presupuesto.proyeccion && (
                  <p>Proyecta: {formatMoney(presupuesto.proyeccion.proyeccionFinal)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
