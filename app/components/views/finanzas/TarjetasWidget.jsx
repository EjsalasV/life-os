"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Edit2, Trash2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function TarjetasWidget({
  tarjetas = [],
  formatMoney,
  openFinanceModal,
  setSelectedCard,
  deleteCard
}) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showCards, setShowCards] = useState(false);

  const totalLimite = tarjetas.reduce((sum, t) => sum + (t.limite || 0), 0);
  const totalUsado = tarjetas.reduce((sum, t) => sum + (t.saldo || 0), 0);
  const totalDisponible = totalLimite - totalUsado;

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
        <div className="flex items-center justify-between gap-3 rounded-xl px-1 py-1.5">
          <button
            onClick={() => setShowCards((current) => !current)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={showCards}
          >
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2">
              <CreditCard size={16} className="text-[var(--fin-cyan)]" />
            </div>
            <div>
              <p className="fin-label text-xs font-black uppercase text-[var(--fin-text)]">
                Tarjetas de Crédito
              </p>
              <p className="text-[9px] text-[var(--fin-text-muted)]">
                {tarjetas.length > 0
                  ? `${tarjetas.length} tarjeta${tarjetas.length === 1 ? "" : "s"} · disponible ${formatMoney(totalDisponible)}`
                  : "No afecta tu flujo de caja"}
              </p>
            </div>
          </div>
          <span className="ml-auto">
            {showCards ? (
              <ChevronUp size={16} className="text-[var(--fin-text-muted)]" />
            ) : (
              <ChevronDown size={16} className="text-[var(--fin-text-muted)]" />
            )}
          </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCard(null);
              openFinanceModal("tarjeta");
            }}
            className="rounded-lg border border-[var(--fin-cyan)]/30 bg-[var(--fin-cyan)]/10 p-2 text-[var(--fin-cyan)] transition hover:bg-[var(--fin-cyan)]/20 active:scale-95"
            aria-label="Agregar tarjeta"
          >
            <Plus size={16} />
          </button>
        </div>

        {showCards && (
          <div className="mt-3 space-y-3">
            {tarjetas.length > 0 && (
              <div className="rounded-[20px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase text-[var(--fin-text-muted)]">
                      Límite Total
                    </p>
                    <p className="text-sm font-black text-[var(--fin-text)]">
                      {formatMoney(totalLimite)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase text-[var(--fin-text-muted)]">
                      Usado
                    </p>
                    <p className="text-sm font-black text-[var(--fin-text)]">
                      {formatMoney(totalUsado)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase text-[var(--fin-text-muted)]">
                      Disponible
                    </p>
                    <p className="text-sm font-black text-[var(--fin-lime)]">
                      {formatMoney(totalDisponible)}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                bar: "bg-amber-500",
                badge: "bg-amber-500/15 text-amber-300"
              },
              ok: {
                bg: "bg-[var(--fin-surface-2)]",
                border: "border-[var(--fin-border-soft)]",
                bar: "bg-[var(--fin-cyan)]",
                badge: "bg-[var(--fin-cyan)]/15 text-[var(--fin-cyan)]"
              }
            }[estado];

                  return (
                    <div
                      key={tarjeta.id}
                      className={`rounded-[20px] border overflow-hidden transition-all ${estadoUI.bg} ${estadoUI.border}`}
                    >
                <button
                  onClick={() => setExpandedCard(expandedCard === tarjeta.id ? null : tarjeta.id)}
                  className="flex w-full items-center justify-between p-4 text-left transition-opacity hover:opacity-80"
                >
                  <div className="text-left">
                    <p className="text-xs font-black text-[var(--fin-text)]">
                      {tarjeta.nombre || "Tarjeta sin nombre"}
                    </p>
                    <p className="mt-1 text-[9px] text-[var(--fin-text-muted)]">
                      {tarjeta.banco || "Banco"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${disponible < 0 ? 'text-rose-400' : 'text-[var(--fin-text)]'}`}>
                      {formatMoney(disponible)}
                    </p>
                    {disponible < 0 && (
                      <span className="mt-1 inline-block rounded-full bg-rose-500/15 px-2 py-1 text-[8px] font-black text-rose-300">
                        ⚠️ EN ROJO
                      </span>
                    )}
                    {disponible >= 0 && (
                      <span className={`text-[8px] font-black px-2 py-1 rounded-full inline-block ${estadoUI.badge} mt-1`}>
                        {porcentajeUso.toFixed(0)}%
                      </span>
                    )}
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
                          openFinanceModal("tarjeta", {
                            id: tarjeta.id,
                            nombre: tarjeta.nombre || "",
                            banco: tarjeta.banco || "",
                            limite: String(tarjeta.limite ?? ""),
                            saldo: String(tarjeta.saldo ?? "")
                          });
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[var(--fin-cyan)]/30 bg-[var(--fin-cyan)]/10 px-3 py-2 text-[9px] font-bold text-[var(--fin-cyan)] transition-colors hover:bg-[var(--fin-cyan)]/20 active:scale-95"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => deleteCard && deleteCard(tarjeta.id)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[9px] font-bold text-rose-300 transition-colors hover:bg-rose-500/20 active:scale-95"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>

                    {/* Advertencia si está cerca del límite */}
                    {porcentajeUso > 80 && (
                      <div className="flex gap-2 rounded-lg bg-black/5 p-2 dark:bg-white/5">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
                        <p className="text-[8px] text-amber-300">
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
              <div className="rounded-[20px] border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface-2)] p-6 text-center">
                <CreditCard size={24} className="mx-auto mb-2 text-[var(--fin-text-muted)]" />
                <p className="mb-2 text-[10px] font-black uppercase text-[var(--fin-text-muted)]">
                  Sin tarjetas registradas
                </p>
                <p className="mb-3 text-[8px] text-[var(--fin-text-muted)]">
                  Agrega tus tarjetas de crédito para trackear el uso sin afectar tu flujo de caja
                </p>
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    openFinanceModal("tarjeta");
                  }}
                  className="mx-auto rounded-lg border border-[var(--fin-cyan)]/30 bg-[var(--fin-cyan)]/10 px-4 py-2 text-[9px] font-black text-[var(--fin-cyan)] transition-colors hover:bg-[var(--fin-cyan)]/20 active:scale-95"
                >
                  + Agregar Tarjeta
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
