import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Target, Zap, PieChart, Calendar } from "lucide-react";

export default function AnalyticsDashboard({
  analyticsData,
  formatMoney,
  isPro
}) {
  if (!isPro) {
    return (
      <div className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-[30px] border border-indigo-200 dark:border-indigo-800 text-center">
        <Zap className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-sm font-black uppercase text-indigo-900 dark:text-indigo-100 mb-2">
          Analytics PRO 💎
        </h3>
        <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-4">
          Mejora a PRO para acceder a análisis avanzados, proyecciones y recomendaciones personalizadas.
        </p>
      </div>
    );
  }

  const {
    gastosMesActual,
    ingresosMesActual,
    ahorroMesActual,
    tasaAhorro,
    gastosMesAnterior,
    variacionMes,
    topCategorias,
    cumplimientoPresupuestos,
    ahorrosPotenciales,
    promedioDiario,
    metasProgreso
  } = analyticsData;

  const mesNombre = new Date(2024, analyticsData.mesActual).toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <PieChart size={18} className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-sm font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">
          Analytics Dashboard
        </h2>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gastos */}
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="text-[9px] font-black uppercase text-rose-400">Gastos</span>
          </div>
          <p className="text-lg font-black text-rose-900 dark:text-rose-100">{formatMoney(gastosMesActual)}</p>
          <p className="text-[8px] text-rose-600 dark:text-rose-400 font-bold mt-1">
            {variacionMes > 0 ? '📈' : '📉'} {Math.abs(Math.round(variacionMes))}% vs mes pasado
          </p>
        </div>

        {/* Ahorros */}
        <div className={`p-4 rounded-2xl border ${ahorroMesActual >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className={ahorroMesActual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
            <span className={`text-[9px] font-black uppercase ${ahorroMesActual >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              Ahorros
            </span>
          </div>
          <p className={`text-lg font-black ${ahorroMesActual >= 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
            {formatMoney(ahorroMesActual)}
          </p>
          <p className={`text-[8px] font-bold mt-1 ${ahorroMesActual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {tasaAhorro}% de los ingresos
          </p>
        </div>

        {/* Ingresos */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[9px] font-black uppercase text-emerald-400">Ingresos</span>
          </div>
          <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">{formatMoney(ingresosMesActual)}</p>
          <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Este mes</p>
        </div>

        {/* Promedio Diario */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[9px] font-black uppercase text-blue-400">Promedio/Día</span>
          </div>
          <p className="text-lg font-black text-blue-900 dark:text-blue-100">{formatMoney(promedioDiario)}</p>
          <p className="text-[8px] text-blue-600 dark:text-blue-400 font-bold mt-1">Gasto promedio</p>
        </div>
      </div>

      {/* Top Categorías */}
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded-[25px] border border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span>🔝</span> Top 5 Categorías
        </h3>
        <div className="space-y-2">
          {topCategorias.map((cat, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{cat.categoria}</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">{cat.porcentaje}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${cat.porcentaje}%` }}
                />
              </div>
              <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">{formatMoney(cat.monto)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cumplimiento de Presupuestos */}
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded-[25px] border border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Target size={14} /> Cumplimiento ({cumplimientoPresupuestos.porcentaje}%)
        </h3>

        <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">
            {cumplimientoPresupuestos.cumple} de {cumplimientoPresupuestos.total} presupuestos respetados
          </p>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              style={{ width: `${cumplimientoPresupuestos.porcentaje}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          {cumplimientoPresupuestos.presupuestos.slice(0, 3).map((p, idx) => (
            <div key={idx} className="flex justify-between items-center text-[9px] font-bold">
              <span className={p.cumple ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {p.cumple ? '✅' : '❌'} {p.categoria}
              </span>
              <span className="text-gray-600 dark:text-gray-400">{p.porcentaje}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ahorros Potenciales */}
      {ahorrosPotenciales > 0 && (
        <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-[25px] border border-green-200 dark:border-green-800">
          <h3 className="text-xs font-black uppercase text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
            <Zap size={14} /> Potencial de Ahorro
          </h3>
          <p className="text-2xl font-black text-green-900 dark:text-green-100 mb-1">
            {formatMoney(ahorrosPotenciales)}
          </p>
          <p className="text-[9px] text-green-700 dark:text-green-400 font-bold">
            Dinero disponible dentro de tus presupuestos que no estás usando
          </p>
        </div>
      )}

      {/* Metas en Progreso */}
      {metasProgreso.length > 0 && (
        <div className="bg-white dark:bg-gray-900/40 p-4 rounded-[25px] border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Target size={14} /> Metas en Progreso
          </h3>

          <div className="space-y-3">
            {metasProgreso.slice(0, 3).map((meta, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{meta.nombre}</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{meta.porcentaje}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                    style={{ width: `${Math.min(100, meta.porcentaje)}%` }}
                  />
                </div>
                <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatMoney(meta.actual)} de {formatMoney(meta.objetivo)} • Falta {formatMoney(meta.restante)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-[25px] border border-purple-100 dark:border-purple-800">
        <h3 className="text-xs font-black uppercase text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
          <span>💡</span> Insights
        </h3>
        <div className="text-[9px] font-bold text-purple-700 dark:text-purple-300 space-y-1">
          {gastosMesActual > 0 && (
            <p>
              • Tu gasto promedio es {formatMoney(promedioDiario)}/día. A este ritmo terminarás el mes con {formatMoney(promedioDiario * 30)} de gastos.
            </p>
          )}
          {tasaAhorro > 20 && (
            <p>
              • 🎉 ¡Excelente tasa de ahorro! Estás guardando el {tasaAhorro}% de tus ingresos.
            </p>
          )}
          {cumplimientoPresupuestos.porcentaje === 100 && (
            <p>
              • ✅ Perfecto. Todos tus presupuestos están bajo control.
            </p>
          )}
          {ahorrosPotenciales > ingresosMesActual * 0.1 && (
            <p>
              • 💰 Tienes {formatMoney(ahorrosPotenciales)} en presupuestos no utilizados. Considera ajustarlos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
