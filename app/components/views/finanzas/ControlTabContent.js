import React from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Plus, Pencil, ShieldCheck } from "lucide-react";
import { Money, ProgressBar, Pill } from "@/components/ui/DesignPrimitives";
import usePresupuestoAlerts from "../../../hooks/usePresupuestoAlerts";
import usePresupuestoAlertasGranulares from "../../../hooks/usePresupuestoAlertasGranulares";
import usePresupuestoHistorySync from "../../../hooks/usePresupuestoHistorySync";

function getEstado(porcentaje) {
  if (porcentaje >= 100) return "critico";
  if (porcentaje >= 85) return "advertencia";
  return "saludable";
}

function getEstadoUI(estado) {
  if (estado === "critico") {
    return {
      badge: "text-rose-300 bg-rose-500/15 border-rose-500/30",
      bar: "from-rose-500 to-red-500",
      label: "Limite superado"
    };
  }

  if (estado === "advertencia") {
    return {
      badge: "text-amber-300 bg-amber-500/15 border-amber-500/30",
      bar: "from-amber-400 to-orange-500",
      label: "Cerca del limite"
    };
  }

  return {
    badge: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    bar: "from-emerald-400 to-lime-400",
    label: "Uso saludable"
  };
}

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
  showToast,
  user
}) {
  const safeSmartMessage = smartMessage || "Sin novedades por ahora.";
  const streak = typeof userStats?.currentStreak === "number" ? userStats.currentStreak : 0;

  usePresupuestoAlerts(presupuestoData, showToast);
  usePresupuestoAlertasGranulares(presupuestoData, showToast);
  usePresupuestoHistorySync(presupuestoData, movimientos, user);

  const gastoTotal = presupuestoData.reduce((acc, item) => acc + (Number(item?.gastado) || 0), 0);
  const limiteTotal = presupuestoData.reduce((acc, item) => acc + (Number(item?.limite) || 0), 0);
  const porcentajeTotal = limiteTotal > 0 ? Math.round((gastoTotal / limiteTotal) * 100) : 0;
  const restante = Math.max(0, limiteTotal - gastoTotal);

  const now = new Date();
  const totalDiasMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const diaMes = now.getDate();
  const diasRestantes = Math.max(0, totalDiasMes - diaMes);
  const promedioDiario = diaMes > 0 ? gastoTotal / diaMes : 0;

  const categoriaCritica = presupuestoData
    .filter((item) => Number(item?.limite) > 0)
    .sort((a, b) => (b?.porcentaje || 0) - (a?.porcentaje || 0))[0];

  const handleEditPresupuesto = (cat) => {
    setSelectedBudgetCat(cat);
    setFormData({ ...formData, limite: cat?.limite > 0 ? cat.limite : "" });
    setModalOpen("presupuesto");
  };

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-[28px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="fin-label text-[10px] font-black uppercase tracking-[0.16em] text-[var(--fin-text-muted)]">Presupuesto · Mes actual</p>
            <p className="fin-mono mt-2 text-3xl font-black text-[var(--fin-text)]">{formatMoney(gastoTotal)}</p>
            <p className="fin-mono text-[11px] font-bold text-[var(--fin-text-muted)]">de {formatMoney(limiteTotal || 0)}</p>
          </div>
          <span className={`fin-chip rounded-full border px-3 py-1 text-[10px] font-black ${porcentajeTotal >= 85 ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"}`}>
            {Math.max(0, porcentajeTotal)}% usado
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--fin-surface-3)]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${porcentajeTotal >= 85 ? "from-amber-400 to-orange-500" : "from-emerald-400 to-lime-400"}`}
            style={{ width: `${Math.min(100, Math.max(0, porcentajeTotal))}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Restante</p>
            <p className="fin-mono mt-1 text-xs font-black text-[var(--fin-lime)]">{formatMoney(restante)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Prom/dia</p>
            <p className="fin-mono mt-1 text-xs font-black text-[var(--fin-text)]">{formatMoney(promedioDiario)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Dias</p>
            <p className="fin-mono mt-1 text-xs font-black text-[var(--fin-text)]">{diaMes}/{totalDiasMes}</p>
            <p className="fin-mono text-[9px] font-bold text-[var(--fin-text-muted)]">{diasRestantes} restantes</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Ingresos</p>
            <div className="mt-1"><Money value={balanceMes?.ingresos || 0} size={16} color="#10b981" /></div>
          </div>
          <div className="rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Gastos</p>
            <div className="mt-1"><Money value={balanceMes?.gastos || 0} size={16} color="#f87171" /></div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-[24px] border border-[var(--fin-cyan)]/25 bg-[var(--fin-cyan)]/10 p-4"
      >
        <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-cyan)]">Proyeccion fin de mes</p>
        <p className="fin-mono mt-1 text-lg font-black text-[var(--fin-text)]">{formatMoney(balanceMes?.proyeccion || 0)}</p>
        <p className="text-[11px] font-bold text-[var(--fin-text-dim)]">Cashflow libre estimado con tus gastos fijos.</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-start gap-3 rounded-[24px] border border-[var(--fin-cyan)]/25 bg-[var(--fin-cyan)]/10 p-4"
      >
        <div className="rounded-xl bg-[var(--fin-cyan)]/20 p-2 text-[var(--fin-cyan)]">
          <Sparkles size={16} />
        </div>
        <div className="flex-1">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-cyan)]">Asistente</p>
          <p className="mt-1 text-sm font-bold leading-snug text-[var(--fin-text)]">{safeSmartMessage}</p>
        </div>
      </motion.section>

      {categoriaCritica && (categoriaCritica?.porcentaje || 0) >= 85 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-start gap-3 rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <div className="rounded-xl bg-amber-500/20 p-2 text-amber-300">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-200">
              Atencion en {categoriaCritica?.label || categoriaCritica?.categoria || "Sin categoria"}
            </p>
            <p className="fin-mono text-[11px] font-bold text-amber-100/80">
              Lleva {categoriaCritica?.porcentaje || 0}% del presupuesto.
            </p>
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Categorias</p>
          <button
            onClick={() => setModalOpen("presupuesto")}
            className="fin-label inline-flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
          >
            <Plus size={12} /> Ajustar
          </button>
        </div>

        <div className="grid gap-3">
          {presupuestoData.map((cat) => {
            const porcentaje = Number.isFinite(cat?.porcentaje) ? cat.porcentaje : 0;
            const estado = getEstado(porcentaje);
            const estadoUI = getEstadoUI(estado);
            const Icon = cat?.icon;

            return (
              <div key={cat?.id || cat?.categoria} className="rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)]">
                      {Icon ? <Icon size={14} className="text-[var(--fin-text-dim)]" /> : <span className="text-xs">.</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[var(--fin-text)]">{cat?.label || cat?.categoria || "Sin categoria"}</p>
                      <p className="fin-mono text-[10px] font-bold text-[var(--fin-text-muted)]">
                        {formatMoney(cat?.gastado || 0)} / {formatMoney(cat?.limite || 0)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditPresupuesto(cat)}
                    className="rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2 text-[var(--fin-text-muted)] transition hover:text-[var(--fin-text)]"
                    title="Editar presupuesto"
                  >
                    <Pencil size={13} />
                  </button>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--fin-surface-3)]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${estadoUI.bar}`}
                    style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="fin-mono text-[10px] font-bold text-[var(--fin-text-muted)]">{porcentaje}%</span>
                  <span className={`fin-chip rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wide ${estadoUI.badge}`}>
                    {estadoUI.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.24, ease: [0.23, 1, 0.32, 1] }}
        onClick={handleNoSpendToday}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--fin-lime)]/30 bg-[var(--fin-lime)]/15 px-4 py-3 text-xs font-black text-[var(--fin-lime)] transition hover:bg-[var(--fin-lime)]/20"
      >
        <ShieldCheck size={15} />
        Hoy no gaste nada · racha {streak} dia{streak === 1 ? "" : "s"}
      </motion.button>
    </div>
  );
}
