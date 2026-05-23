import React, { useState } from "react";
import { useUser } from "@/context/auth";
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Target,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertTriangle
} from "lucide-react";
import ExpensesChart from "../../charts/ExpensesChart";
import PremiumLock from "../../ui/PremiumLock";
import FlujoCajaWidget from "./FlujoCajaWidget";
import PresupuestoDetailWidget from "./PresupuestoDetailWidget";
import PresupuestosAlertasPanel from "./PresupuestosAlertasPanel";
import usePresupuestoAlerts from "../../../hooks/usePresupuestoAlerts";
import usePresupuestoAlertasGranulares from "../../../hooks/usePresupuestoAlertasGranulares";
import usePresupuestoHistorySync from "../../../hooks/usePresupuestoHistorySync";

export default function ControlTabContent({
  smartMessage,
  userStats,
  handleNoSpendToday,
  balanceMes,
  formatMoney,
  presupuestoData,
  setSelectedBudgetCat,
  setModalOpen,
  setFormData,
  formData,
  movimientos,
  isPro,
  showToast,
  user
}) {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const safeSmartMessage = smartMessage || "Sin novedades por ahora.";
  const streak = typeof userStats?.currentStreak === "number" ? userStats.currentStreak : 0;

  // Use presupuesto alerts hook
  usePresupuestoAlerts(presupuestoData, showToast);

  // Use granular alerts by threshold
  const { getAlertStatus, getAlertedPresupuestos } = usePresupuestoAlertasGranulares(presupuestoData, showToast);

  // Sync presupuesto history when month changes
  usePresupuestoHistorySync(presupuestoData, movimientos, user);

  const handleEditPresupuesto = (presupuesto) => {
    setSelectedBudgetCat(presupuesto);
    setFormData({ ...formData, limite: presupuesto.limite > 0 ? presupuesto.limite : "" });
    setModalOpen("presupuesto");
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-200"><Sparkles size={16} /></div>
        <div><p className="text-[10px] uppercase font-black text-blue-400 mb-0.5">Asistente</p><p className="text-xs font-bold text-blue-900 dark:text-blue-100 leading-snug">{safeSmartMessage}</p></div>
      </div>

      <div className="p-6 rounded-[30px] bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg relative overflow-hidden text-center">
        <Flame className="absolute -right-4 -bottom-4 text-white opacity-20" size={120} />
        <h2 className="text-5xl font-black mb-1">{streak}</h2>
        <p className="text-[10px] uppercase font-black opacity-80 mb-4">Días de Racha</p>
        <button onClick={handleNoSpendToday} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 mx-auto transition-all active:scale-95"><ShieldCheck size={16} /> Hoy no gasté nada</button>
      </div>

      <div className="p-5 bg-indigo-900 text-white rounded-[25px] shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-indigo-700 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] uppercase font-black text-indigo-200 mb-1">Proyección Fin de Mes</p>
          <p className="text-2xl font-black">{formatMoney(balanceMes.proyeccion)}</p>
          <p className="text-[9px] text-indigo-300 font-bold mt-1">Cashflow libre estimado</p>
        </div>
        <Target className="text-indigo-400 relative z-10" size={24} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800"><div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-500" /><span className="text-[9px] font-black text-emerald-400 uppercase">Ingresos</span></div><p className="text-lg font-black text-emerald-900 dark:text-emerald-100">{formatMoney(balanceMes.ingresos)}</p></div>
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800"><div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-rose-500" /><span className="text-[9px] font-black text-rose-400 uppercase">Gastos</span></div><p className="text-lg font-black text-rose-900 dark:text-rose-100">{formatMoney(balanceMes.gastos)}</p></div>
      </div>

      {/* Widget de Flujo de Caja */}
      <FlujoCajaWidget balanceMes={balanceMes} formatMoney={formatMoney} />

      <div>
        <PremiumLock isPro={isPro} text="Análisis PRO">
          <ExpensesChart movimientos={movimientos} />
        </PremiumLock>
      </div>

      {selectedPresupuesto && (
        <PresupuestoDetailWidget
          presupuestoData={presupuestoData}
          formatMoney={formatMoney}
          selectedPresupuesto={selectedPresupuesto}
          onEdit={handleEditPresupuesto}
          proyeccionData={presupuestoData}
        />
      )}

      {/* Panel de Alertas Activas */}
      <PresupuestosAlertasPanel
        presupuestoData={presupuestoData}
        formatMoney={formatMoney}
      />

      <div className="grid gap-3">
        {presupuestoData.map(cat => {
          const categoriaLabel = cat.categoria || "Sin categoría";
          const porcentaje = Number.isFinite(cat.porcentaje) ? cat.porcentaje : 0;
          const estado =
            porcentaje >= 100 ? "critico" :
            porcentaje >= 80 ? "advertencia" :
            porcentaje > 0 ? "activo" : "sin-uso";

          const estadoUI = {
            critico: {
              ring: "border-rose-200 dark:border-rose-800",
              chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
              bar: "bg-gradient-to-r from-rose-500 to-red-500",
              label: "Límite superado"
            },
            advertencia: {
              ring: "border-amber-200 dark:border-amber-800",
              chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
              bar: "bg-gradient-to-r from-amber-500 to-orange-500",
              label: "Cerca del límite"
            },
            activo: {
              ring: "border-blue-200 dark:border-blue-800",
              chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
              bar: "bg-gradient-to-r from-blue-500 to-cyan-500",
              label: "Uso saludable"
            },
            "sin-uso": {
              ring: "border-gray-200 dark:border-gray-700",
              chip: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
              bar: "bg-gradient-to-r from-gray-400 to-gray-500",
              label: "Sin movimientos"
            }
          }[estado];

          const estadoProyeccion = cat.proyeccion?.estado || 'seguro';
          const proyeccionEmoji = {
            critico: '🚨',
            peligro: '🔴',
            advertencia: '🟠',
            elevado: '🟡',
            seguro: '✅'
          }[estadoProyeccion];

          return (
            <div key={cat.id} className={`bg-white dark:bg-gray-900/40 p-4 rounded-[28px] relative border shadow-sm ${estadoUI.ring} ${selectedPresupuesto?.id === cat.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="absolute top-4 right-4 flex gap-2 items-center">
                {cat.proyeccion && (
                  <span title={`Proyección: ${cat.proyeccion.estado}`} className="text-sm">
                    {proyeccionEmoji}
                  </span>
                )}
                <button
                  onClick={() => setSelectedPresupuesto(selectedPresupuesto?.id === cat.id ? null : cat)}
                  className="text-gray-300 hover:text-blue-500 active:scale-90 transition-transform p-1"
                  title="Ver detalles"
                >
                  <span className="text-xs font-black">📊</span>
                </button>
                <button
                  onClick={() => handleEditPresupuesto(cat)}
                  className="text-gray-300 hover:text-blue-500 active:scale-90 transition-transform"
                >
                  <Settings size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                  {cat.icon ? <cat.icon size={14} /> : <div className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{cat.label}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black mb-1 text-gray-400 dark:text-gray-500">
                <span>Gastado: {formatMoney(cat.gastado)}</span>
                <span>Límite: {cat.limite > 0 ? formatMoney(cat.limite) : "∞"}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${estadoUI.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {categoriaLabel}
                </p>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${estadoUI.chip}`}>
                  {estadoUI.label}: {porcentaje}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
