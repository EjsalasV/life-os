"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function FlujoCajaWidget({ balanceMes, formatMoney }) {
  const disponible = balanceMes.ingresos - balanceMes.gastos;
  const porcentajeGastado = balanceMes.ingresos > 0
    ? (balanceMes.gastos / balanceMes.ingresos) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Flujo de Caja Principal */}
      <div className="p-6 rounded-[25px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase font-black text-white/80 mb-4">Flujo de Caja Real</p>

          {/* Desglose */}
          <div className="space-y-3 mb-5">
            {/* Ingresos */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-300" />
                <span className="text-[10px] font-bold">Ingresos</span>
              </div>
              <span className="text-lg font-black">+{formatMoney(balanceMes.ingresos)}</span>
            </div>

            {/* Gastos */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-rose-300" />
                <span className="text-[10px] font-bold">Gastos</span>
              </div>
              <span className="text-lg font-black">-{formatMoney(balanceMes.gastos)}</span>
            </div>

            {/* Línea divisoria */}
            <div className="h-px bg-white/20" />

            {/* Disponible */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-yellow-200" />
                <span className="text-[11px] font-black">Disponible Real</span>
              </div>
              <span className="text-3xl font-black">
                {disponible >= 0 ? '+' : ''}{formatMoney(disponible)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Porcentaje */}
      <div className="p-4 bg-white dark:bg-gray-900/40 rounded-[20px] border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[9px] font-black text-gray-600 dark:text-gray-400 uppercase">
            Proporción de Gasto
          </p>
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {porcentajeGastado.toFixed(1)}%
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              porcentajeGastado > 100 ? "bg-rose-500" :
              porcentajeGastado > 80 ? "bg-amber-500" :
              "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, porcentajeGastado)}%` }}
          />
        </div>

        {/* Status */}
        <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-2">
          {porcentajeGastado > 100
            ? "⚠️ Has gastado más de lo que ingresaste"
            : porcentajeGastado > 80
            ? "⚠️ Estás gastando mucho de tu ingreso"
            : "✅ Flujo de caja saludable"
          }
        </p>
      </div>

      {/* Desglose por Categoría - Opcional */}
      <div className="text-[9px] text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-[15px]">
        <p className="font-black mb-2">Nota:</p>
        <p>Este es tu flujo de caja REAL (sin tarjetas de crédito). Las tarjetas se muestran en la sección <strong>Billetera</strong>.</p>
      </div>
    </div>
  );
}
