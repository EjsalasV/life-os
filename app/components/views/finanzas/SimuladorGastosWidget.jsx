"use client";

import React, { useState } from "react";
import { Calculator, TrendingDown } from "lucide-react";

export default function SimuladorGastosWidget({ presupuestoData, formatMoney }) {
  const [simulacion, setSimulacion] = useState(null);
  const [selectedCat, setSelectedCat] = useState(presupuestoData[0]?.id || null);
  const [monto, setMonto] = useState("");

  const calcularSimulacion = () => {
    if (!monto || isNaN(monto) || !selectedCat) return;

    const categoria = presupuestoData.find(c => c.id === selectedCat);
    if (!categoria) return;

    const nuevoGastado = categoria.gastado + parseFloat(monto);
    const nuevoDisponible = Math.max(0, categoria.limite - nuevoGastado);
    const porcentajeNuevo = categoria.limite > 0 ? (nuevoGastado / categoria.limite) * 100 : 0;

    setSimulacion({
      categoria,
      montoGasto: parseFloat(monto),
      gastadoActual: categoria.gastado,
      nuevoGastado,
      disponibleActual: Math.max(0, categoria.limite - categoria.gastado),
      disponibleNuevo: nuevoDisponible,
      porcentajeActual: categoria.porcentaje,
      porcentajeNuevo: Math.min(100, porcentajeNuevo),
      superaLimite: nuevoGastado > categoria.limite
    });
  };

  const limpiar = () => {
    setSimulacion(null);
    setMonto("");
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-900/40 rounded-[25px] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
          Simulador de Gastos
        </p>
      </div>

      {/* Selector de Categoría */}
      <div>
        <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase block mb-2">
          Categoría
        </label>
        <select
          value={selectedCat}
          onChange={(e) => {
            setSelectedCat(e.target.value);
            setSimulacion(null);
            setMonto("");
          }}
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {presupuestoData.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.label} (Límite: {cat.limite > 0 ? `$${cat.limite}` : "∞"})
            </option>
          ))}
        </select>
      </div>

      {/* Input de Monto */}
      <div>
        <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase block mb-2">
          ¿Cuánto quieres gastar?
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-black text-[10px]">
              $
            </span>
            <input
              type="number"
              value={monto}
              onChange={(e) => {
                setMonto(e.target.value);
                setSimulacion(null);
              }}
              placeholder="0.00"
              className="w-full pl-6 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={calcularSimulacion}
            disabled={!monto || isNaN(monto) || !selectedCat}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-black text-[10px] transition-colors active:scale-95"
          >
            Simular
          </button>
        </div>
      </div>

      {/* Resultado de Simulación */}
      {simulacion && (
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            {/* Disponible Actual */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-[12px]">
              <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1">
                Disponible Ahora
              </p>
              <p className="text-sm font-black text-blue-700 dark:text-blue-300">
                {formatMoney(simulacion.disponibleActual)}
              </p>
            </div>

            {/* Disponible Después */}
            <div
              className={`p-3 rounded-[12px] ${
                simulacion.superaLimite
                  ? "bg-rose-50 dark:bg-rose-900/20"
                  : "bg-emerald-50 dark:bg-emerald-900/20"
              }`}
            >
              <p
                className={`text-[8px] font-black uppercase mb-1 ${
                  simulacion.superaLimite
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                Después de gastar ${simulacion.montoGasto}
              </p>
              <p
                className={`text-sm font-black ${
                  simulacion.superaLimite
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {formatMoney(simulacion.disponibleNuevo)}
              </p>
            </div>
          </div>

          {/* Barras de Progreso */}
          <div className="space-y-2">
            {/* Antes */}
            <div>
              <div className="flex justify-between mb-1 text-[8px] font-bold text-gray-500 dark:text-gray-400">
                <span>Uso actual</span>
                <span>{simulacion.porcentajeActual.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, simulacion.porcentajeActual)}%` }}
                />
              </div>
            </div>

            {/* Después */}
            <div>
              <div className="flex justify-between mb-1 text-[8px] font-bold text-gray-500 dark:text-gray-400">
                <span>Uso después</span>
                <span>{simulacion.porcentajeNuevo.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    simulacion.superaLimite ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, simulacion.porcentajeNuevo)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Advertencia si supera límite */}
          {simulacion.superaLimite && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-[12px] border border-rose-200 dark:border-rose-800">
              <p className="text-[9px] font-black text-rose-700 dark:text-rose-300">
                ⚠️ ¡Superarías el límite por ${(simulacion.nuevoGastado - simulacion.categoria.limite).toFixed(2)}!
              </p>
            </div>
          )}

          <button
            onClick={limpiar}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[9px] font-bold transition-colors"
          >
            Limpiar Simulación
          </button>
        </div>
      )}
    </div>
  );
}
