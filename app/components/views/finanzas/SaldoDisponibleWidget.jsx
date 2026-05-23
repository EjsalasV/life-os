"use client";

import React from "react";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";

export default function SaldoDisponibleWidget({ presupuestoData, formatMoney }) {
  const totalDisponible = presupuestoData.reduce((sum, cat) => {
    const disponible = Math.max(0, cat.limite - cat.gastado);
    return sum + disponible;
  }, 0);

  const categoriasConSaldo = presupuestoData.filter(cat => cat.limite > 0 && cat.gastado < cat.limite);
  const categoriasAgotadas = presupuestoData.filter(cat => cat.limite > 0 && cat.gastado >= cat.limite);

  return (
    <div className="space-y-4">
      {/* Saldo Total Disponible */}
      <div className="p-6 rounded-[25px] bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} />
            <p className="text-[10px] uppercase font-black text-white/80">Saldo Disponible Total</p>
          </div>
          <p className="text-4xl font-black mb-1">{formatMoney(totalDisponible)}</p>
          <p className="text-[9px] text-white/70">Para gastar en todas las categorías</p>
        </div>
      </div>

      {/* Categorías Disponibles */}
      {categoriasConSaldo.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 px-2">Disponible por Categoría</p>
          <div className="grid grid-cols-2 gap-2">
            {categoriasConSaldo.map(cat => {
              const disponible = cat.limite - cat.gastado;
              return (
                <div
                  key={cat.id}
                  className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-[16px] border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {cat.icon && <cat.icon size={12} className="text-emerald-600 dark:text-emerald-400" />}
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 truncate">
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatMoney(disponible)}
                  </p>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">
                    de {formatMoney(cat.limite)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorías Agotadas */}
      {categoriasAgotadas.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-[16px] border border-rose-200 dark:border-rose-800 flex gap-3">
          <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-[9px]">
            <p className="font-black text-rose-700 dark:text-rose-300 mb-1">
              {categoriasAgotadas.length} categoría{categoriasAgotadas.length > 1 ? 's' : ''} sin saldo
            </p>
            <p className="text-rose-600 dark:text-rose-400">
              {categoriasAgotadas.map(c => c.label).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
