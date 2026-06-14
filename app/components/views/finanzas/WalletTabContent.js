import React, { useMemo, useState } from "react";
import {
  Wallet,
  Trash2,
  Plus,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Edit2
} from "lucide-react";
import { exportToExcel } from "@/app/utils/exportHandler";
import PremiumLock from "../../ui/PremiumLock";
import TarjetasWidget from "./TarjetasWidget";

export default function WalletTabContent({
  setModalOpen,
  setSelectedAccountId,
  cuentas,
  selectedAccountId,
  deleteItem,
  visibleMovimientos,
  totalCuentasBalance,
  hasMovimientos,
  formatMoney,
  filterDate,
  setFilterDate,
  userPlan,
  tarjetas = [],
  setSelectedCard,
  deleteCard
}) {
  const [showTools, setShowTools] = useState(false);
  const [txFilter, setTxFilter] = useState("all");

  const ingresosPeriodo = visibleMovimientos
    .filter((item) => item?.tipo === "INGRESO")
    .reduce((acc, item) => acc + (Number(item?.monto) || 0), 0);

  const gastosPeriodo = visibleMovimientos
    .filter((item) => item?.tipo !== "INGRESO")
    .reduce((acc, item) => acc + (Number(item?.monto) || 0), 0);

  const filteredMovements = useMemo(() => {
    if (txFilter === "in") return visibleMovimientos.filter((item) => item?.tipo === "INGRESO");
    if (txFilter === "out") return visibleMovimientos.filter((item) => item?.tipo !== "INGRESO");
    return visibleMovimientos;
  }, [txFilter, visibleMovimientos]);

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Balance disponible</p>
            <p className="fin-mono mt-1 text-3xl font-black text-[var(--fin-lime)]">{formatMoney(totalCuentasBalance)}</p>
          </div>
          <button
            onClick={() => setSelectedAccountId(null)}
            className="rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2 text-[var(--fin-text-muted)] transition hover:text-[var(--fin-text)]"
            title="Ver todo"
          >
            <Wallet size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setModalOpen("movimiento")}
            className="fin-label rounded-xl border border-[var(--fin-lime)]/35 bg-[var(--fin-lime)]/15 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[var(--fin-lime)] transition hover:bg-[var(--fin-lime)]/25"
          >
            + Registrar
          </button>
          <button
            onClick={() => setModalOpen("transferencia")}
            className="fin-label inline-flex items-center justify-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
          >
            <ArrowRightLeft size={14} /> Transferir
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Ingresos</p>
            <p className="fin-mono mt-1 text-xs font-black text-emerald-700 dark:text-emerald-300">{formatMoney(ingresosPeriodo)}</p>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">Gastos</p>
            <p className="fin-mono mt-1 text-xs font-black text-rose-700 dark:text-rose-300">{formatMoney(gastosPeriodo)}</p>
          </div>
        </div>
      </section>

      <TarjetasWidget
        tarjetas={tarjetas}
        formatMoney={formatMoney}
        setModalOpen={setModalOpen}
        setSelectedCard={setSelectedCard}
        deleteCard={deleteCard}
      />

      <section className="rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
        <button
          onClick={() => setShowTools(!showTools)}
          className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-1.5 text-[var(--fin-text-muted)]">
              <FileSpreadsheet size={14} />
            </div>
            <span className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Herramientas Excel</span>
          </div>
          {showTools ? <ChevronUp size={16} className="text-[var(--fin-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--fin-text-muted)]" />}
        </button>

        {showTools && (
          <div className="mt-2">
            <PremiumLock isPro={userPlan === "pro"} text="Solo PRO">
              <button
                onClick={() => exportToExcel(visibleMovimientos, `${filterDate.month + 1}-${filterDate.year}`)}
                className="fin-label flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <FileSpreadsheet size={16} />
                <span className="text-[10px] font-black uppercase">Descargar</span>
              </button>
            </PremiumLock>
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Cuentas</p>
          <button
            onClick={() => setModalOpen("cuenta")}
            className="fin-label inline-flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
          >
            <Plus size={12} /> Nueva
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAccountId(null)}
            className={`min-w-[130px] rounded-2xl border p-3 text-left transition ${
              !selectedAccountId
                ? "border-[var(--fin-lime)]/40 bg-[var(--fin-lime)]/15"
                : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)]"
            }`}
          >
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Todas</p>
            <p className="fin-mono mt-1 text-sm font-black text-[var(--fin-text)]">{formatMoney(totalCuentasBalance)}</p>
          </button>

          {cuentas.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedAccountId(c.id)}
              className={`group relative min-w-[130px] rounded-2xl border p-3 text-left transition ${
                selectedAccountId === c.id
                  ? "border-[var(--fin-cyan)]/40 bg-[var(--fin-cyan)]/10"
                  : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)]"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem("cuentas", c);
                }}
                className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 text-rose-300"
              >
                <Trash2 size={12} />
              </button>
              <p className="fin-label truncate text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">{c?.nombre || "Cuenta"}</p>
              <p className="fin-mono mt-1 text-sm font-black text-[var(--fin-text)]">{formatMoney(c?.monto || 0)}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 mt-2 flex items-center justify-between px-1">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">
            {selectedAccountId ? "Historial" : "Movimientos"}
          </p>

          <div className="flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-1">
            <select
              value={filterDate.month}
              onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value, 10) })}
              className="fin-mono rounded-lg bg-transparent px-2 py-1 text-[10px] font-black text-[var(--fin-text-muted)] outline-none"
            >
              {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={filterDate.year}
              onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value, 10) })}
              className="fin-mono rounded-lg bg-transparent px-2 py-1 text-[10px] font-black text-[var(--fin-text-muted)] outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button onClick={() => window.print()} className="rounded-lg p-1.5 text-[var(--fin-cyan)] hover:bg-[var(--fin-cyan)]/10">
              <Printer size={13} />
            </button>
          </div>
        </div>

        <div className="mb-2 flex gap-1 px-1">
          {[
            { id: "all", label: "Todas" },
            { id: "in", label: "Ingresos" },
            { id: "out", label: "Gastos" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTxFilter(item.id)}
              className={`fin-chip rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition ${
                txFilter === item.id
                  ? "border-[var(--fin-lime)] bg-[var(--fin-lime)] text-[var(--fin-surface)]"
                  : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)] text-[var(--fin-text-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 pb-20">
          {filteredMovements.map((m) => (
            <div key={m.id} className="group flex items-center justify-between rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.tipo === "INGRESO" ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"}`}>
                  {m.tipo === "INGRESO" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--fin-text)]">{m?.nombre || "Movimiento"}</p>
                  <p className="fin-mono text-[10px] font-bold text-[var(--fin-text-muted)]">
                    {(m?.categoria || "General")} · {(m?.displayDate || "")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className={`fin-mono text-sm font-black ${m.tipo === "INGRESO" ? "text-emerald-500" : "text-[var(--fin-text)]"}`}>
                  {m?.amountPrefix}{formatMoney(m?.monto || 0)}
                </p>
                <button
                  onClick={() => {
                    // Pre-llenar el formulario con los datos del movimiento
                    setFinanceForm({
                      id: m.id,
                      nombre: m.nombre,
                      tipo: m.tipo,
                      monto: m.monto,
                      cuentaId: m.cuentaId,
                      categoria: m.categoria,
                      fecha: m.fecha || new Date().toISOString().split('T')[0]
                    });
                    setModalOpen("movimiento");
                  }}
                  className="opacity-0 transition group-hover:opacity-100 text-blue-400 hover:text-blue-600"
                >
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteItem("movimientos", m)} className="opacity-0 transition group-hover:opacity-100 text-rose-400 hover:text-rose-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {!hasMovimientos && (
            <div className="fin-label rounded-2xl border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface)] p-8 text-center text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-muted)]">
              No hay movimientos en este periodo.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
