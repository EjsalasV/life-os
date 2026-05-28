"use client";

import React, { useMemo } from "react";
import { Activity, Crown, ShoppingBag, Wallet } from "lucide-react";
import { motion } from "framer-motion";

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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

function Spark({ color = "var(--life-wallet)" }) {
  return (
    <svg width="88" height="36" viewBox="0 0 88 36" style={{ display: "block" }}>
      <path d="M2 30 C14 22, 24 25, 34 16 C44 10, 54 14, 66 8 C74 4, 80 6, 86 2" fill="none" stroke={color} strokeWidth="2" />
      <path d="M2 30 C14 22, 24 25, 34 16 C44 10, 54 14, 66 8 C74 4, 80 6, 86 2 L86 36 L2 36 Z" fill={color} fillOpacity="0.16" />
    </svg>
  );
}

function ModuleTile({ number, name, tagline, color, onClick, stat, statLabel, extras, visual }) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-[22px] border px-[18px] py-[18px] text-left transition-all hover:brightness-[1.02]"
      style={{
        background: `radial-gradient(circle at top right, ${color}22, var(--life-surface) 72%)`,
        borderColor: `${color}66`,
      }}
    >
      <div className="absolute right-[14px] top-[12px] flex items-center gap-[6px]">
        <span className="font-mono text-[11px] tracking-[0.15em]" style={{ color }}>{number}</span>
        <span className="h-[4px] w-[4px]" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="m-0 text-[22px] font-semibold tracking-[-0.03em] text-[var(--life-text)]">{name}</h3>
          <p className="m-0 mt-[2px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--life-text-muted)]">{tagline}</p>
        </div>
        <div className="mr-8">{visual}</div>
      </div>

      <div className="mb-3">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--life-text-muted)]">{statLabel}</p>
        {stat}
      </div>

      <div className="flex items-end gap-2 border-t pt-[10px]" style={{ borderColor: `${color}44` }}>
        {extras.map((item) => (
          <div key={item.label} className="flex-1">
            <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--life-text-muted)]">{item.label}</p>
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

export default function HomeView({ setActiveTab, user, userStats }) {
  const isPro = user?.plan === "pro";
  const time = useMemo(() => getCurrentTime(), []);
  const dateLabel = useMemo(() => getCurrentDateLabel(), []);

  const modules = [
    {
      id: "finanzas",
      number: "01",
      name: "Wallet",
      tagline: "Finanzas personales",
      color: "var(--life-wallet)",
      statLabel: "Balance disponible",
      stat: (
        <p className="m-0 font-mono text-[24px] font-bold text-[var(--life-text)]">
          <span className="mr-1 text-[16px] opacity-60">$</span>
          {formatMoney(4287.5)}
        </p>
      ),
      extras: [
        { label: "Gasto mes", value: "$2,914", tone: "good" },
        { label: "Restante", value: "$1,586", tone: "neutral" },
      ],
      visual: <Spark color="var(--life-wallet)" />,
    },
    {
      id: "ventas",
      number: "02",
      name: "Negocio",
      tagline: "Panel comercial",
      color: "var(--life-business)",
      statLabel: "Ingresos · mayo",
      stat: (
        <p className="m-0 font-mono text-[24px] font-bold text-[var(--life-business)]">
          <span className="mr-1 text-[16px] opacity-70">$</span>
          {formatMoney(18420)}
        </p>
      ),
      extras: [
        { label: "Pedidos hoy", value: "23", tone: "good" },
        { label: "Margen", value: "61.0%", tone: "good" },
      ],
      visual: <Spark color="var(--life-business)" />,
    },
    {
      id: "salud",
      number: "03",
      name: "Salud",
      tagline: "Pet + progreso",
      color: "var(--life-health)",
      statLabel: "Progreso de mascota",
      stat: (
        <p className="m-0 font-mono text-[24px] font-bold text-[var(--life-accent)]">
          740
          <span className="ml-1 text-[14px] text-[var(--life-text-muted)]">/1000 XP</span>
        </p>
      ),
      extras: [
        { label: "Kcal", value: "1820", tone: "good" },
        { label: "Habitos", value: "4/7", tone: "warn" },
      ],
      visual: (
        <div className="rounded-xl border border-[var(--life-border)] bg-[var(--life-surface-2)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--life-text-dim)]">
          Kibi • happy
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
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--life-text-dim)]">Life OS</p>
              <p className="m-0 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--life-accent)]">v1.0 · online</p>
            </div>
          </div>
          <div className="text-right">
            <p className="m-0 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--life-text-muted)]">{dateLabel}</p>
            <p className="m-0 font-mono text-[18px] font-black tracking-tight text-[var(--life-text)]">{time}</p>
          </div>
        </div>

        <h2 className="m-0 text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--life-text)]">
          Buenas tardes,
          <br />
          <span style={{ color: "var(--life-accent)" }}>{user?.name || "Usuario"}</span>
        </h2>
        <p className="mt-2 text-[13px] text-[var(--life-text-dim)]">
          Tu racha va en {userStats?.currentStreak || 0} dias, buen ritmo hoy.
        </p>
      </div>

      <div className="space-y-3 px-0">
        {modules.map((module) => (
          <ModuleTile
            key={module.id}
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

      <div className="px-0 pt-1">
        <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--life-text-muted)]">Acceso rapido</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "+ Gasto", icon: "−$", color: "#f87171", tab: "finanzas" },
            { label: "+ Ingreso", icon: "+$", color: "var(--life-accent)", tab: "finanzas" },
            { label: "+ Venta", icon: "$", color: "var(--life-business)", tab: "ventas" },
            { label: "+ Comida", icon: "🍴", color: "#fb7185", tab: "salud" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.tab)}
              className="rounded-[14px] border px-0 py-3"
              style={{
                background: "var(--life-surface)",
                borderColor: `${item.color}55`,
              }}
            >
              <div
                className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-[8px] font-mono text-sm font-bold"
                style={{ background: `${item.color}22`, color: item.color }}
              >
                {item.icon}
              </div>
              <p className="m-0 text-[10px] font-semibold text-[var(--life-text-dim)]">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {!isPro && (
        <div
          className="relative overflow-hidden rounded-[22px] px-5 py-5 text-white"
          style={{
            background: "linear-gradient(135deg, var(--life-business) 0%, #d15f05 100%)",
          }}
        >
          <Crown className="absolute -bottom-4 -right-3 opacity-20" size={94} />
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] opacity-80">Oferta especial</p>
          <h3 className="mb-3 text-xl font-black leading-tight">Lleva tu negocio al siguiente nivel</h3>
          <button
            onClick={() => setActiveTab("settings")}
            className="rounded-xl bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#d15f05]"
          >
            Mejorar por $5.00
          </button>
        </div>
      )}
    </div>
  );
}
