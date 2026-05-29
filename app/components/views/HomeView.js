"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, Store, Activity } from "lucide-react";
import { Money, ProgressBar, SparkLine } from "@/components/ui/DesignPrimitives";

function getCurrentTime() {
  return new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getCurrentDateLabel() {
  const now = new Date();
  const day = now
    .toLocaleDateString("es-CO", { weekday: "short" })
    .toUpperCase()
    .replace(".", "");
  const date = now
    .toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(".", "");
  return `${date} · ${day}`;
}

function ModuleCard({ icon: Icon, name, description, color, onClick, delay = 0, metrics = [] }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.15, duration: 0.4 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-[28px] border p-6 text-left transition-all"
      style={{
        background: `linear-gradient(135deg, ${color}11, ${color}06)`,
        borderColor: `${color}44`,
        boxShadow: `
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          ${color}22 0px 0px 30px
        `
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="m-0 text-[28px] font-bold tracking-[-0.02em] text-[var(--life-text)]">
            {name}
          </h3>
          <p className="m-0 mt-2 text-[14px] text-[var(--life-text-dim)]">
            {description}
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon size={32} style={{ color }} strokeWidth={1.5} />
        </div>
      </div>

      {/* Métricas informativas */}
      {metrics && metrics.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: `${color}22` }}>
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--life-text-muted)]">
                {metric.label}
              </span>
              <span className="text-[12px] font-black text-[var(--life-text)]">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: `${color}22` }}>
        <span className="text-sm font-semibold" style={{ color }}>
          Ingresar
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{ background: color, color: "#000" }}
        >
          →
        </div>
      </div>
    </motion.button>
  );
}

export default function HomeView({
  setActiveTab,
  user,
  userStats = {},
  data = {},
  metrics = {},
  formatMoney = (v) => v,
}) {
  const time = useMemo(() => getCurrentTime(), []);
  const dateLabel = useMemo(() => getCurrentDateLabel(), []);

  // Datos de Finanzas
  const balanceTotal = userStats?.balance || 0;
  const gastoMesActual = metrics?.balanceMes?.spent || 0;
  const presupuestoMes = metrics?.balanceMes?.budgeted || 2500;
  const movimientosRecientes = data?.movimientos?.slice(0, 30) || [];
  const sparkFinanzas = movimientosRecientes
    .reverse()
    .map((m) => Math.abs(m.amount || 0))
    .slice(0, 8) || [16, 28, 35, 42, 50, 58, 64, 72];

  // Datos de Ventas
  const ventasHoy = (data?.ventas || []).filter((v) => {
    const today = new Date().toISOString().split("T")[0];
    return v.createdAt?.startsWith(today);
  }).length || 0;

  const ventasMes = (data?.ventas || []).length || 0;
  const ingresosMes = (data?.ventas || []).reduce((sum, v) => sum + (v.total || 0), 0) || 0;
  const sparkVentas = [12, 18, 24, 16, 28, 36, 30, 42] || [];

  // Datos de Salud
  const nivelMascota = userStats?.petLevel || 1;
  const xpMascota = userStats?.petXP || 0;
  const xpMax = 1000;
  const saludMascota = userStats?.petHealth || 80;
  const habitos = data?.habitos || [];
  const habitosDiaHoy = data?.saludHoy?.habitos || 0;

  // Métricas para cada módulo
  const finanzasMetrics = [
    { label: "Saldo", value: formatMoney(balanceTotal) },
    { label: "Gasto mes", value: formatMoney(gastoMesActual) },
  ];

  const negocioMetrics = [
    { label: "Ventas mes", value: ventasMes.toString() },
    { label: "Ingresos", value: formatMoney(ingresosMes) },
  ];

  const saludMetrics = [
    { label: "Mascota Lvl", value: nivelMascota.toString() },
    { label: "Salud", value: `${saludMascota}%` },
  ];

  const modules = [
    {
      id: "finanzas",
      icon: Wallet,
      name: "Finanzas",
      description: "Control de tu dinero y presupuestos",
      color: "#0284c7",
      metrics: finanzasMetrics,
    },
    {
      id: "ventas",
      icon: Store,
      name: "Negocio",
      description: "Gestión de ventas y productos",
      color: "#d97706",
      metrics: negocioMetrics,
    },
    {
      id: "salud",
      icon: Activity,
      name: "Salud",
      description: "Tu mascota y seguimiento de hábitos",
      color: "#65a30d",
      metrics: saludMetrics,
    },
  ];

  return (
    <div
      className="space-y-3 pb-24"
      style={{
        background: "radial-gradient(ellipse at top, var(--life-accent-soft), transparent 60%)",
        borderRadius: 16,
      }}
    >
      <div className="px-2 pt-1">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="grid h-7 w-7 grid-cols-2 gap-[2px] rounded-[7px] p-[3px]"
              style={{ background: "var(--life-accent)" }}
            >
              <span className="rounded-[1px] bg-black/80" />
              <span className="rounded-[1px] bg-black/80" />
              <span className="rounded-[1px] bg-black/80" />
              <span className="rounded-[1px] bg-black/80" />
            </div>
            <div>
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--life-text-dim)]">
                Life OS
              </p>
              <p className="m-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--life-accent)]">
                v1.0 · online
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="m-0 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--life-text-muted)]">
              {dateLabel}
            </p>
            <p className="m-0 font-mono text-[18px] font-black tracking-tight text-[var(--life-text)]">
              {time}
            </p>
          </div>
        </div>

        <h2 className="m-0 text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--life-text)]">
          Buenas tardes,
          <br />
          <span style={{ color: "var(--life-accent)" }}>{user?.name || "Usuario"}</span>
        </h2>
        <p className="mt-2 text-[13px] text-[var(--life-text-dim)]">
          {userStats?.currentStreak ? (
            <>Tu racha va en {userStats.currentStreak} días, buen ritmo hoy. 🔥</>
          ) : (
            <>Empieza tu racha hoy. Pequeños pasos, grandes cambios. 💪</>
          )}
        </p>
      </div>

      <div className="space-y-4 px-0 mt-8">
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            delay={index}
            icon={module.icon}
            name={module.name}
            description={module.description}
            color={module.color}
            metrics={module.metrics}
            onClick={() => setActiveTab(module.id)}
          />
        ))}
      </div>

      <div className="px-0 pt-1"></div>
    </div>
  );
}
