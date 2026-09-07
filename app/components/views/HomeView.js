"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Store, Activity, ArrowDownRight, ArrowUpRight, ShoppingCart, Apple, ChevronRight, Heart, Zap, Star } from "lucide-react";
import { getTime, safeMonto, formatMoney } from "@/app/utils/helpers";
import { createInitialFinanceForm } from "@/app/hooks/dashboard/useDashboardUIState";
import { usePet } from "@/app/hooks/usePet";
import { useDashboard } from "@/context/dashboard";
import LifeCard from "@/app/components/ui/LifeCard";
import { getDailyRecommendation } from "@/app/lib/dailyRecommendation";
import { getWeeklySummary } from "@/app/lib/weeklySummary";
import { LIFE_PERSONALITIES } from "@/app/lib/lifePersonality";
import PetSprite from "@/app/components/ui/PetSprite";

function saludoPorHora(hora) {
  if (hora < 12) return "Buenos días,";
  if (hora < 19) return "Buenas tardes,";
  return "Buenas noches,";
}

// ¿El timestamp cae dentro del mes calendario actual?
function isCurrentMonth(timestamp) {
  const t = getTime(timestamp);
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return t >= inicio && t < fin;
}

function isToday(timestamp) {
  const time = getTime(timestamp);
  const date = new Date(time);
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
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
      className="home-module-card life-card w-full p-3 text-left transition-all hover:-translate-y-1"
      style={{
        '--life-card-accent': color
      }}
    >
      <div className="flex min-h-[122px] flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}20` }}>
            <Icon size={19} style={{ color }} strokeWidth={1.8} />
          </div>
          <ChevronRight size={16} className="mt-1 text-[var(--life-text-muted)]" />
        </div>
        <div>
          <h3 className="m-0 text-[14px] font-black tracking-[-0.02em] text-[var(--life-text)]">
            {name}
          </h3>
          <p className="m-0 mt-1 line-clamp-2 text-[10px] leading-tight text-[var(--life-text-dim)]">
            {description}
          </p>
        </div>
      </div>

      {/* Métricas informativas */}
      {metrics && metrics.length > 0 && (
        <div className="mt-3 space-y-1 border-t pt-3" style={{ borderColor: `${color}22` }}>
          {metrics.map((metric, idx) => (
            <div key={idx} className="block">
              <span className="block truncate text-[8px] font-bold uppercase text-[var(--life-text-muted)]">
                {metric.label}
              </span>
              <span className="block truncate text-[12px] font-black text-[var(--life-text)]">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <span className="mt-3 block text-[9px] font-black uppercase tracking-[0.08em]" style={{ color }}>Ver más</span>
    </motion.button>
  );
}

export default function HomeView({ personality = "equilibrado" }) {
  const { user, ui, data } = useDashboard();
  const { setActiveTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { setFinanceForm } = ui.forms;
  const { setHealthForm } = ui.forms;
  const userStats = data.userStats || {};
  const personalityConfig = LIFE_PERSONALITIES[personality] || LIFE_PERSONALITIES.equilibrado;
  // Pet real de Firestore (mismo doc que usa la pestaña Salud)
  const { pet, estadoEmocional } = usePet();

  // Saludo según la hora, actualizado por minuto (antes era "Buenas tardes" fijo)
  const [saludo, setSaludo] = useState(() => saludoPorHora(new Date().getHours()));
  useEffect(() => {
    const t = setInterval(() => setSaludo(saludoPorHora(new Date().getHours())), 60000);
    return () => clearInterval(t);
  }, []);

  // Datos de Finanzas
  // - Saldo total: suma de cuentas (fuente de verdad mantenida por batches)
  // - Gasto mes: data.movimientos ya viene filtrado al mes seleccionado (mes actual por defecto)
  const cuentas = data?.cuentas || [];
  const balanceTotal = cuentas.reduce((sum, c) => sum + safeMonto(c?.monto), 0);
  const gastoMesActual = (data?.movimientos || [])
    .filter((m) => m.tipo === "GASTO" && isCurrentMonth(m.timestamp))
    .reduce((sum, m) => sum + safeMonto(m.monto), 0);

  // Datos de Ventas (solo mes calendario actual)
  const ventasDelMes = (data?.ventas || []).filter((v) => isCurrentMonth(v.timestamp));
  const ventasMes = ventasDelMes.length;
  const ingresosMes = ventasDelMes.reduce((sum, v) => sum + safeMonto(v.total), 0);

  // Datos de Salud (pet real, no placeholders)
  const nivelMascota = pet?.nivel || 1;
  const saludMascota = Math.round(pet?.salud ?? 0);
  const dailyRecommendation = getDailyRecommendation({
    pet,
    movimientos: data?.movimientos || [],
    ventas: data?.ventas || [],
    enfoque: user?.onboardingFocus || "equilibrio"
  });
  const weeklySummary = getWeeklySummary({
    movimientos: data?.movimientos || [],
    ventas: data?.ventas || [],
    pet,
    userStats
  });
  const dailyActions = Object.values(pet?.actividadHoy || {})
    .reduce((sum, value) => sum + (Number(value) || 0), 0)
    + (data?.movimientos || []).filter((item) => isToday(item.timestamp)).length
    + (data?.ventas || []).filter((item) => isToday(item.timestamp)).length;
  const petMood = {
    extatico: { label: "Está radiante", emoji: "✨" },
    feliz: { label: "Está feliz contigo", emoji: "😊" },
    normal: { label: "Está esperando tu próxima acción", emoji: "👀" },
    cansado: { label: "Necesita un poco de energía", emoji: "⚡" },
    triste: { label: "Necesita que lo cuides", emoji: "💛" }
  }[estadoEmocional] || { label: "Está contigo hoy", emoji: "🐾" };

  // Métricas para cada módulo
  const finanzasMetrics = [
    { label: "Saldo Total", value: formatMoney(balanceTotal) },
    { label: "Gasto mes", value: formatMoney(gastoMesActual) },
  ];

  const negocioMetrics = [
    { label: "Ventas mes", value: ventasMes.toString() },
    { label: "Ingresos", value: formatMoney(ingresosMes) },
  ];

  const saludMetrics = [
    { label: "Mascota Lvl", value: nivelMascota.toString() },
    { label: "Progreso", value: `${pet?.experiencia || 0} XP` },
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
      className={`home-view home-view--${personality} space-y-3 pb-24`}
      style={{
        background: "radial-gradient(ellipse at top, var(--life-accent-soft), transparent 60%)",
        borderRadius: 16,
      }}
    >
      <div className="px-2 pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--life-text-muted)]">{saludo} {user?.name || "Usuario"}</p>
        <h2 className="mt-2 m-0 text-[32px] font-black leading-[1.02] tracking-[-0.06em] text-[var(--life-text)]">
          Pequeños pasos,
          <br />
          <span style={{ color: "var(--life-accent)" }}>mejor energía.</span>
        </h2>
      </div>

      <LifeCard className="home-companion-card overflow-hidden bg-[var(--life-surface-2)] p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-[var(--life-accent-soft)]">
            <PetSprite type={pet?.tipo || "gatoNaranja"} mood={estadoEmocional} energy={pet?.energia || 70} scale={2.4} embedded embeddedLeftPct={50} embeddedBottomPct={12} roam={0} step={0} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--life-text-muted)]">Tu compañero</p>
                <p className="mt-1 text-lg font-black text-[var(--life-text)]">{pet?.nombre || "Tu mascota"}</p>
              </div>
              <span className="rounded-full bg-[var(--life-accent-soft)] px-2 py-1 text-[10px] font-black text-[var(--life-accent)]">Nv. {nivelMascota}</span>
            </div>
            <p className="mt-1 text-[11px] font-bold text-[var(--life-text-dim)]">{personalityConfig.mascotLabel}</p>
            <div className="mt-2 flex gap-2 text-[10px] font-bold text-[var(--life-text-dim)]">
              <span className="inline-flex items-center gap-1"><Zap size={12} className="text-[var(--life-accent)]" /> {pet?.energia ?? 0}</span>
              <span className="inline-flex items-center gap-1"><Heart size={12} className="text-rose-400" /> {pet?.felicidad ?? 0}</span>
              <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-400" /> {pet?.experiencia ?? 0} XP</span>
            </div>
          </div>
        </div>
      </LifeCard>

      <LifeCard as={motion.button}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (dailyRecommendation.modal === "nutricion") {
            setHealthForm((current) => ({ ...current, foodName: "", foodQuantity: 1, foodCalories: "", tipoComida: "almuerzo" }));
            setModalOpen("nutricion");
          } else if (dailyRecommendation.modal === "agua") {
            setModalOpen("agua");
          } else if (dailyRecommendation.modal && setModalOpen) {
            setModalOpen(dailyRecommendation.modal);
          } else setActiveTab(dailyRecommendation.tab);
        }}
        className="home-next-action w-full bg-[var(--life-surface)] p-4 text-left transition-colors hover:border-[var(--life-accent)]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--life-accent-soft)] text-2xl">{dailyRecommendation.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--life-text-muted)]">{personalityConfig.recommendationLabel} · {userStats?.currentStreak || 0} días</p>
            <p className="mt-1 text-sm font-black text-[var(--life-text)]">{dailyRecommendation.label}</p>
            <p className="mt-0.5 text-[11px] text-[var(--life-text-dim)]">{dailyRecommendation.detail}</p>
          </div>
          <ChevronRight className="mt-1 shrink-0 text-[var(--life-accent)]" size={22} aria-hidden="true" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--life-surface-2)] px-3 py-2">
          <p className="text-[11px] font-bold text-[var(--life-text-dim)]">
            {petMood.emoji} {pet?.nombre || "Tu mascota"} {petMood.label.toLowerCase()}.
          </p>
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--life-accent)]">Hacer ahora</span>
        </div>
      </LifeCard>

      <LifeCard className="home-weekly-card bg-[var(--life-surface)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--life-text-muted)]">Tu semana en una mirada</p>
            <p className="mt-1 text-lg font-black text-[var(--life-text)]">{weeklySummary.totalActions} acciones que cuentan</p>
          </div>
          <span className="rounded-full bg-[var(--life-accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--life-accent)]">{weeklySummary.streak} días</span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--life-text-muted)]">
            <span>{weeklySummary.milestone.label}</span>
            <span>{Math.min(weeklySummary.totalActions, weeklySummary.milestone.goal)}/{weeklySummary.milestone.goal}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--life-border-soft)]">
            <div className="h-full rounded-full bg-[var(--life-accent)] transition-all" style={{ width: `${Math.min(100, weeklySummary.milestone.progress)}%` }} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[var(--life-surface-2)] p-2">
            <p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">Ventas</p>
            <p className="mt-1 text-sm font-black text-[var(--life-text)]">{weeklySummary.salesCount}</p>
          </div>
          <div className="rounded-xl bg-[var(--life-surface-2)] p-2">
            <p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">Ingresos</p>
            <p className="mt-1 text-sm font-black text-[var(--life-text)]">{formatMoney(weeklySummary.income + weeklySummary.salesIncome)}</p>
          </div>
          <div className="rounded-xl bg-[var(--life-surface-2)] p-2">
            <p className="text-[9px] font-bold uppercase text-[var(--life-text-muted)]">Gastos</p>
            <p className="mt-1 text-sm font-black text-[var(--life-text)]">{formatMoney(weeklySummary.expenses)}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] font-bold text-[var(--life-text-dim)]">
          {personality === "aventura"
            ? (dailyActions > 0
              ? `Misión del día: ${dailyActions} ${dailyActions === 1 ? "acción completada" : "acciones completadas"}.`
              : "Misión del día: completa tu primera acción.")
            : personality === "esencial"
              ? (dailyActions > 0
                ? `${dailyActions} ${dailyActions === 1 ? "avance registrado" : "avances registrados"} hoy.`
                : "Aún no hay avances registrados hoy.")
              : (dailyActions > 0
                ? `Hoy: ${dailyActions} ${dailyActions === 1 ? "avance" : "avances"} que tu mascota recuerda.`
                : "Tu día está listo para empezar. Elige una acción pequeña.")}
        </p>
        <p className="mt-1 text-[11px] font-bold text-[var(--life-text-dim)]">{weeklySummary.actionDelta >= 0 ? `+${weeklySummary.actionDelta}` : weeklySummary.actionDelta} acciones frente a la semana pasada.</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--life-text-dim)]">{weeklySummary.insight}</p>
      </LifeCard>

      <div className="home-modules-grid mt-6 grid grid-cols-3 gap-2 px-0">
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

      {/* Quick Access Buttons */}
      {setModalOpen && (
        <div className="home-quick-access mt-6 border-t border-[var(--life-border-soft)] px-0 pt-6">
          <p className="text-[10px] font-black uppercase text-[var(--life-text-muted)] mb-4 px-2">
            Acceso Rápido
          </p>
          <div className="grid grid-cols-4 gap-2">
            {/* Ingreso Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * 0.45 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (setFinanceForm) {
                  setFinanceForm(createInitialFinanceForm({ tipo: "INGRESO" }));
                }
                setModalOpen("movimiento");
              }}
              className="relative overflow-hidden rounded-2xl border p-2.5 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #22c55e11, #22c55e06)",
                borderColor: "#22c55e44",
                boxShadow: "#22c55e22 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#22c55e20" }}
                >
                  <ArrowDownRight size={18} style={{ color: "#22c55e" }} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-black text-[var(--life-text)]">
                  Ingreso
                </span>
              </div>
            </motion.button>

            {/* Gasto Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * 0.60 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (setFinanceForm) {
                  setFinanceForm(createInitialFinanceForm({ tipo: "GASTO" }));
                }
                setModalOpen("movimiento");
              }}
              className="relative overflow-hidden rounded-2xl border p-2.5 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #ef444411, #ef444406)",
                borderColor: "#ef444444",
                boxShadow: "#ef444422 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#ef444420" }}
                >
                  <ArrowUpRight size={18} style={{ color: "#ef4444" }} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-black text-[var(--life-text)]">
                  Gasto
                </span>
              </div>
            </motion.button>

            {/* Venta Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * 0.75 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => setModalOpen("cobrar")}
              className="relative overflow-hidden rounded-2xl border p-2.5 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #f5972211, #f5972206)",
                borderColor: "#f5972244",
                boxShadow: "#f5972222 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#f5972220" }}
                >
                  <ShoppingCart size={18} style={{ color: "#f59722" }} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-black text-[var(--life-text)]">
                  Venta
                </span>
              </div>
            </motion.button>

            {/* Comida Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * 0.90 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                setHealthForm((current) => ({ ...current, foodName: "", foodQuantity: 1, foodCalories: "", tipoComida: "almuerzo" }));
                setModalOpen("nutricion");
              }}
              className="relative overflow-hidden rounded-2xl border p-2.5 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #65a30d11, #65a30d06)",
                borderColor: "#65a30d44",
                boxShadow: "#65a30d22 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#65a30d20" }}
                >
                  <Apple size={18} style={{ color: "#65a30d" }} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-black text-[var(--life-text)]">
                  Comida
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      )}

      <div className="px-0 pt-1"></div>
    </div>
  );
}
