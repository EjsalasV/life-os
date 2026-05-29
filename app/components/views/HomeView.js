"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
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

function ModuleTile({ number, name, tagline, color, onClick, stat, statLabel, extras, visual, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-[22px] border px-[18px] py-[18px] text-left transition-all animate-fade-in-scale"
      style={{
        background: `radial-gradient(circle at top right, ${color}22, var(--life-surface) 72%)`,
        borderColor: `${color}66`,
        boxShadow: `
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          ${color}22 0px 0px 20px
        `
      }}
    >
      <div className="absolute right-[14px] top-[12px] flex items-center gap-[6px]">
        <span className="font-mono text-[11px] tracking-[0.15em]" style={{ color }}>
          {number}
        </span>
        <span className="h-[4px] w-[4px]" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="m-0 text-[22px] font-semibold tracking-[-0.03em] text-[var(--life-text)]">
            {name}
          </h3>
          <p className="m-0 mt-[2px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--life-text-muted)]">
            {tagline}
          </p>
        </div>
        <div className="mr-8">{visual}</div>
      </div>

      <div className="mb-3">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--life-text-muted)]">
          {statLabel}
        </p>
        {stat}
      </div>

      <div className="flex items-end gap-2 border-t pt-[10px]" style={{ borderColor: `${color}44` }}>
        {extras.map((item) => (
          <div key={item.label} className="flex-1">
            <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--life-text-muted)]">
              {item.label}
            </p>
            <p
              className="m-0 font-mono text-[13px] font-semibold"
              style={{
                color:
                  item.tone === "good"
                    ? "var(--life-accent)"
                    : item.tone === "warn"
                      ? "var(--life-business)"
                      : "var(--life-text)",
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
        <div
          className="grid h-8 w-8 place-items-center rounded-[10px] text-sm font-black"
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

  const modules = [
    {
      id: "finanzas",
      number: "01",
      name: "Wallet",
      tagline: "Finanzas personales",
      color: "var(--life-wallet)",
      statLabel: "Balance disponible",
      stat: <Money value={balanceTotal} size={24} color="var(--life-wallet)" />,
      extras: [
        {
          label: "Gasto mes",
          value: `$${formatMoney(gastoMesActual)}`,
          tone: gastoMesActual < presupuestoMes ? "good" : "warn",
        },
        {
          label: "Restante",
          value: `$${formatMoney(Math.max(0, presupuestoMes - gastoMesActual))}`,
          tone: "neutral",
        },
      ],
      visual: <SparkLine data={sparkFinanzas} color="var(--life-wallet)" width={88} height={36} />,
    },
    {
      id: "ventas",
      number: "02",
      name: "Negocio",
      tagline: "Panel comercial",
      color: "var(--life-business)",
      statLabel: "Ingresos · mes",
      stat: <Money value={ingresosMes} size={24} color="var(--life-business)" />,
      extras: [
        {
          label: "Pedidos hoy",
          value: ventasHoy.toString(),
          tone: ventasHoy > 0 ? "good" : "neutral",
        },
        {
          label: "Total mes",
          value: ventasMes.toString(),
          tone: "good",
        },
      ],
      visual: <SparkLine data={sparkVentas} color="var(--life-business)" width={88} height={36} />,
    },
    {
      id: "salud",
      number: "03",
      name: "Salud",
      tagline: "Pet + progreso",
      color: "var(--life-health)",
      statLabel: "Progreso de mascota",
      stat: (
        <div className="space-y-2">
          <p className="m-0 font-mono text-[24px] font-bold text-[var(--life-accent)]">
            LVL {nivelMascota}
            <span className="ml-2 text-[14px] text-[var(--life-text-muted)]">
              {xpMascota}/{xpMax} XP
            </span>
          </p>
          <ProgressBar value={xpMascota} max={xpMax} color="var(--life-accent)" size="sm" showLabel={false} />
        </div>
      ),
      extras: [
        {
          label: "Salud",
          value: `${saludMascota}%`,
          tone: saludMascota > 70 ? "good" : saludMascota > 40 ? "warn" : "bad",
        },
        {
          label: "Hábitos",
          value: `${habitosDiaHoy}/${habitos.length}`,
          tone: habitosDiaHoy >= Math.floor(habitos.length / 2) ? "good" : "warn",
        },
      ],
      visual: (
        <div className="rounded-xl border border-[var(--life-border)] bg-[var(--life-surface-2)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--life-text-dim)]">
          Pet · {saludMascota > 70 ? "happy" : "neutral"}
        </div>
      ),
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

      <div className="space-y-3 px-0">
        {modules.map((module, index) => (
          <ModuleTile
            key={module.id}
            delay={index}
            number={module.number}
            name={module.name}
            tagline={module.tagline}
            color={module.color}
            statLabel={module.statLabel}
            stat={module.stat}
            extras={module.extras}
            visual={module.visual}
            onClick={() => setActiveTab(module.id)}
          />
        ))}
      </div>

      <div className="px-0 pt-1"></div>
    </div>
  );
}
