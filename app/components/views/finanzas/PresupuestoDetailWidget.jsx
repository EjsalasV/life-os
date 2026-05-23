import React, { useMemo } from "react";
import { AlertCircle, TrendingDown, Calendar, Info } from "lucide-react";

export default function PresupuestoDetailWidget({
  presupuestoData,
  formatMoney,
  selectedPresupuesto,
  onEdit
}) {
  if (!selectedPresupuesto) return null;

  const presupuesto = presupuestoData.find(p => p.id === selectedPresupuesto.id);
  if (!presupuesto) return null;

  const { limite, gastado, historial = [] } = presupuesto;
  const porcentaje = limite > 0 ? (gastado / limite) * 100 : 0;

  // Determinar estado y colores
  const getEstado = () => {
    if (porcentaje >= 100) return { tipo: 'critico', label: 'Límite superado', color: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-900/20', borderColor: 'border-rose-200 dark:border-rose-800' };
    if (porcentaje >= 80) return { tipo: 'advertencia', label: 'Cerca del límite', color: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-800' };
    return { tipo: 'activo', label: 'Uso saludable', color: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-200 dark:border-emerald-800' };
  };

  const estado = getEstado();
  const restante = Math.max(0, limite - gastado);
  const proyeccion = useMemo(() => {
    if (historial.length < 2) return gastado;
    const meses = Math.min(2, historial.length);
    const promedioGastado = historial.slice(0, meses).reduce((acc, h) => acc + h.gastado, 0) / meses;
    return Math.round(promedioGastado);
  }, [historial, gastado]);

  // Últimos 6 meses de historial
  const historialMostrado = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (historial.length === 0) return [];

    return historial.slice(0, 6).map(h => ({
      ...h,
      mesLabel: meses[h.mes] || 'Mes'
    })).reverse();
  }, [historial]);

  return (
    <div className={`p-5 rounded-[25px] border ${estado.borderColor} ${estado.bgLight}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${estado.color} text-white`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-500 dark:text-gray-400">
              {presupuesto.label}
            </p>
            <p className="text-sm font-black text-gray-900 dark:text-white">
              {estado.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => onEdit(presupuesto)}
          className="text-xs font-black px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          Ajustar
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black mb-2 text-gray-600 dark:text-gray-400">
          <span>Gastado: {formatMoney(gastado)}</span>
          <span>Límite: {formatMoney(limite)}</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${estado.color}`}
            style={{ width: `${Math.min(100, porcentaje)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400">
          <span>{Math.round(porcentaje)}% utilizado</span>
          {restante > 0 && <span>Disponible: {formatMoney(restante)}</span>}
        </div>
      </div>

      {/* Alerts */}
      {porcentaje >= 80 && (
        <div className={`p-3 rounded-lg mb-4 flex gap-2 ${estado.color === 'bg-rose-500' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          <AlertCircle size={16} className={estado.color === 'bg-rose-500' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} />
          <div className="text-[10px] font-bold">
            <p className={estado.color === 'bg-rose-500' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
              {porcentaje >= 100
                ? `¡Presupuesto excedido por ${formatMoney(gastado - limite)}!`
                : `Cerca del límite. Gasta con cuidado.`}
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-white/40 dark:bg-black/20 rounded-lg">
          <p className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 mb-0.5">Proyección</p>
          <p className="text-xs font-black text-gray-900 dark:text-white">{formatMoney(proyeccion)}</p>
        </div>
        <div className="p-2 bg-white/40 dark:bg-black/20 rounded-lg">
          <p className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 mb-0.5">Promedio</p>
          <p className="text-xs font-black text-gray-900 dark:text-white">
            {historial.length > 0 ? formatMoney(Math.round(historial.reduce((a, h) => a + h.gastado, 0) / historial.length)) : '—'}
          </p>
        </div>
      </div>

      {/* Histórico */}
      {historialMostrado.length > 0 && (
        <div className="pt-3 border-t border-white/20">
          <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Calendar size={12} /> Histórico
          </p>
          <div className="space-y-1">
            {historialMostrado.map((h, idx) => (
              <div key={idx} className="flex justify-between text-[9px] font-bold text-gray-600 dark:text-gray-400">
                <span>{h.mesLabel}</span>
                <span>{formatMoney(h.gastado)} / {formatMoney(h.limite)}</span>
                {h.superado && <span className="text-rose-500">⚠️</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
