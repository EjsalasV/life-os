"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";

export default function TarjetasWidget({
  tarjetas = [],
  formatMoney,
  setModalOpen,
  setSelectedCard,
  deleteCard
}) {
  const [expandedCard, setExpandedCard] = useState(null);

  const totalLimite = tarjetas.reduce((sum, t) => sum + (t.limite || 0), 0);
  const totalUsado = tarjetas.reduce((sum, t) => sum + (t.saldo || 0), 0);
  const totalDisponible = totalLimite - totalUsado;

  return (
    <div className="space-y-4">
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CreditCard size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
              Tarjetas de Crédito
            </p>
            <p className="text-[8px] text-gray-500 dark:text-gray-400">
              No afecta tu flujo de caja
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedCard(null);
            setModalOpen("tarjeta");
          }}
          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors active:scale-95"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Resumen Total */}
      {tarjetas.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-[20px] border border-purple-200 dark:border-purple-800">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase mb-1">
                Límite Total
              </p>
              <p className="text-sm font-black text-purple-900 dark:text-purple-100">
                {formatMoney(totalLimite)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black text-pink-600 dark:text-pink-400 uppercase mb-1">
                Usado
              </p>
              <p className="text-sm font-black text-pink-900 dark:text-pink-100">
                {formatMoney(totalUsado)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                Disponible
              </p>
              <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                {formatMoney(totalDisponible)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tarjetas */}
      {tarjetas.length > 0 ? (
        <div className="space-y-3">
          {tarjetas.map(tarjeta => {
            const porcentajeUso = tarjeta.limite > 0
              ? (tarjeta.saldo / tarjeta.limite) * 100
              : 0;
            const disponible = tarjeta.limite - tarjeta.saldo;

            const estado =
              porcentajeUso >= 100 ? "critico" :
              porcentajeUso >= 80 ? "advertencia" :
              "ok";

            const estadoUI = {
              critico: {
                bg: "bg-rose-50 dark:bg-rose-900/20",
                border: "border-rose-200 dark:border-rose-800",
                bar: "bg-rose-500",
                badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              },
              advertencia: {
                bg: "bg-amber-50 dark:bg-amber-900/20",
                border: "border-amber-200 dark:border-amber-800",
                bar: "bg-amber-500",
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              },
              ok: {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-200 dark:border-blue-800",
                bar: "bg-blue-500",
                badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              }
            }[estado];

            return (
              <div
                key={tarjeta.id}
                className={`rounded-[20px] border overflow-hidden transition-all ${estadoUI.bg} ${estadoUI.border}`}
              >
                <button
                  onClick={() => setExpandedCard(expandedCard === tarjeta.id ? null : tarjeta.id)}
                  className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-900 dark:text-white">
                      {tarjeta.nombre || "Tarjeta sin nombre"}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                      {tarjeta.banco || "Banco"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {formatMoney(disponible)}
                    </p>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full inline-block ${estadoUI.badge} mt-1`}>
                      {porcentajeUso.toFixed(0)}%
                    </span>
                  </div>
                </button>

                {/* Expandido */}
                {expandedCard === tarjeta.id && (
                  <div className="p-4 pt-0 space-y-3 border-t border-gray-300/20">
                    {/* Barra de uso */}
                    <div>
                      <div className="flex justify-between text-[8px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        <span>Usado</span>
                        <span>{formatMoney(tarjeta.saldo)} de {formatMoney(tarjeta.limite)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${estadoUI.bar}`}
                          style={{ width: `${Math.min(100, porcentajeUso)}%` }}
                        />
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedCard(tarjeta);
                          setModalOpen("tarjeta");
                        }}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-[9px] font-bold transition-colors flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => deleteCard && deleteCard(tarjeta.id)}
                        className="px-3 py-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-[9px] font-bold transition-colors flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>

                    {/* Advertencia si está cerca del límite */}
                    {porcentajeUso > 80 && (
                      <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg flex gap-2">
                        <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[8px] text-amber-700 dark:text-amber-300">
                          {porcentajeUso >= 100
                            ? "Límite superado"
                            : "Aproximándose al límite"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center bg-gray-50 dark:bg-gray-900/20 rounded-[20px] border border-gray-200 dark:border-gray-800">
          <CreditCard size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-2">
            Sin tarjetas registradas
          </p>
          <p className="text-[8px] text-gray-500 dark:text-gray-500 mb-3">
            Agrega tus tarjetas de crédito para trackear el uso sin afectar tu flujo de caja
          </p>
          <button
            onClick={() => {
              setSelectedCard(null);
              setModalOpen("tarjeta");
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-[9px] font-black transition-colors active:scale-95 mx-auto"
          >
            + Agregar Tarjeta
          </button>
        </div>
      )}
    </div>
  );
}
