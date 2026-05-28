import React from "react";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";
import PremiumLock from "../../ui/PremiumLock";

export default function FutureTabContent({
  isPro,
  fijos,
  metas,
  totalFijosMensuales,
  formatMoney,
  setModalOpen,
  deleteItem,
  setSelectedMeta
}) {
  const totalObjetivo = metas.reduce((acc, item) => acc + (Number(item?.montoObjetivo) || 0), 0);
  const totalActual = metas.reduce((acc, item) => acc + (Number(item?.montoActual) || 0), 0);
  const progresoGlobal = totalObjetivo > 0 ? Math.min(100, Math.round((totalActual / totalObjetivo) * 100)) : 0;
  const pendienteTotal = Math.max(0, totalObjetivo - totalActual);

  return (
    <PremiumLock isPro={isPro} text="Planificacion PRO">
      <div className="space-y-4">
        <section className="rounded-[28px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-5 shadow-sm">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Proyeccion y metas</p>
          <p className="fin-mono mt-2 text-3xl font-black text-[var(--fin-lime)]">{formatMoney(totalActual)}</p>
          <p className="fin-mono text-[11px] font-bold text-[var(--fin-text-muted)]">acumulado de {formatMoney(totalObjetivo || 0)}</p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--fin-surface-3)]">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-400" style={{ width: `${progresoGlobal}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
              <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Gastos fijos</p>
              <p className="fin-mono mt-1 text-sm font-black text-[var(--fin-text)]">{formatMoney(totalFijosMensuales)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
              <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Pendiente</p>
              <p className="fin-mono mt-1 text-sm font-black text-amber-300">{formatMoney(pendienteTotal)}</p>
            </div>
            <button
              onClick={() => setModalOpen("fijo")}
              className="fin-label inline-flex items-center justify-center gap-1 rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3 text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
            >
              <Plus size={13} /> Nuevo fijo
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--fin-lime)]/30 bg-[var(--fin-lime)]/10 p-4">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-lime)]">Insight</p>
          <p className="mt-1 text-sm font-black text-[var(--fin-text)]">
            {progresoGlobal >= 70
              ? "Vas adelantado con tus metas."
              : progresoGlobal >= 40
                ? "Buen ritmo, manten constancia."
                : "Activa aportes semanales para acelerar tus metas."}
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Pagos fijos</p>
          </div>
          <div className="space-y-2">
            {fijos.map((f) => (
              <div key={f.id} className="group flex items-center justify-between rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--fin-text)]">{f?.nombre || "Sin nombre"}</p>
                  <p className="fin-mono text-[10px] font-bold text-[var(--fin-text-muted)]">Cobro dia {f?.diaCobro || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="fin-mono text-sm font-black text-[var(--fin-text)]">{formatMoney(f?.monto || 0)}</p>
                  <button onClick={() => deleteItem("fijos", f)} className="text-rose-300 opacity-0 transition group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {fijos.length === 0 && (
              <div className="fin-label rounded-2xl border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface)] p-6 text-center text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-muted)]">
                Aun no tienes gastos fijos.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Metas activas</p>
            <button
              onClick={() => setModalOpen("meta")}
              className="fin-label inline-flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
            >
              <Plus size={12} /> Nueva
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-20">
            {metas.map((m) => (
              <div key={m.id} className="group rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2 text-[var(--fin-cyan)]">
                    <Target size={14} />
                  </div>
                  <button onClick={() => deleteItem("metas", m)} className="text-rose-300 opacity-0 transition group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>

                <p className="truncate text-sm font-black text-[var(--fin-text)]">{m?.nombre || "Meta"}</p>
                <p className="fin-mono mt-1 text-[10px] font-bold text-[var(--fin-text-muted)]">
                  {formatMoney(m?.montoActual || 0)} / {formatMoney(m?.montoObjetivo || 0)}
                </p>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--fin-surface-3)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-400" style={{ width: `${Math.min(100, Math.max(0, Number(m?.progreso) || 0))}%` }} />
                </div>

                <button
                  onClick={() => {
                    setSelectedMeta(m);
                    setModalOpen("ahorroMeta");
                  }}
                  className="fin-label mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-[var(--fin-cyan)]/30 bg-[var(--fin-cyan)]/10 py-2 text-[10px] font-black uppercase tracking-wide text-[var(--fin-cyan)] transition hover:bg-[var(--fin-cyan)]/20"
                >
                  <TrendingUp size={12} /> Ahorrar +
                </button>
              </div>
            ))}

            {metas.length === 0 && (
              <div className="fin-label col-span-2 rounded-2xl border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface)] p-8 text-center text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-muted)]">
                Crea tu primera meta para empezar a proyectar.
              </div>
            )}
          </div>
        </section>
      </div>
    </PremiumLock>
  );
}
