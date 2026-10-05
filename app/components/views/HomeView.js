"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Store, Activity, ArrowDownRight, ArrowUpRight, ShoppingCart, Apple, ChevronRight, Heart, Zap, Star } from "lucide-react";
import { getTime, safeMonto, formatMoney } from "@/app/utils/helpers";
import { createInitialFinanceForm } from "@/app/hooks/dashboard/useDashboardUIState";
import { usePet } from "@/app/hooks/usePet";
import { useDashboard } from "@/context/dashboard";
import LifeCard from "@/app/components/ui/LifeCard";
import { getDailyRecommendation } from "@/app/lib/dailyRecommendation";
import { getWeeklySummary } from "@/app/lib/weeklySummary";
import PetSprite from "@/app/components/ui/PetSprite";
import { AdventureFlag, AdventureIcon } from "@/app/components/ui/AdventureIcons";

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

function formatBalancedDate(date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

function getBalancedGreeting(hour) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getBalancedWeekDays(movimientos = [], ventas = []) {
  const today = new Date();
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const actions = [...movimientos, ...ventas].filter((item) => {
      const timestamp = getTime(item?.timestamp);
      if (!timestamp) return false;
      const actionDate = new Date(timestamp);
      return actionDate.getFullYear() === date.getFullYear()
        && actionDate.getMonth() === date.getMonth()
        && actionDate.getDate() === date.getDate();
    }).length;
    return {
      label: new Intl.DateTimeFormat("es-CO", { weekday: "short" }).format(date).replace(".", "").slice(0, 1).toUpperCase(),
      date: date.getDate(),
      actions,
      isToday: date.toDateString() === today.toDateString(),
      isFuture: date > today
    };
  });
}

function BalancedRecommendationIcon({ recommendation }) {
  const Icon = recommendation?.key === "hydration" || recommendation?.key === "meal"
    ? Activity
    : recommendation?.key?.includes("finance") || recommendation?.key === "review-spend"
      ? Wallet
      : recommendation?.key?.includes("sale") || recommendation?.key?.includes("business")
        ? Store
        : ArrowUpRight;
  return <Icon size={26} strokeWidth={1.8} aria-hidden="true" />;
}

function BalancedHero({ recommendation, onAction }) {
  return (
    <section className="balanced-next-card home-navy-card overflow-hidden p-5">
      <div className="balanced-next-heading"><span><span className="balanced-next-icon"><BalancedRecommendationIcon recommendation={recommendation} /></span> Tu siguiente movimiento</span></div>
      <div className="balanced-next-action">
        <div className="balanced-next-row"><p>{recommendation.label}</p><button type="button" onClick={onAction}>Listo <span aria-hidden="true">✓</span></button></div>
      </div>
    </section>
  );
}

function BalancedCompanionCard({ pet, estadoEmocional, petMood, onOpenVitality }) {
  return (
    <section className="balanced-companion home-navy-card overflow-hidden p-5">
      <div className="balanced-companion-top">
        <div className="balanced-companion-label"><span>Compañero</span><i aria-hidden="true" /></div>
        <button type="button" className="balanced-vitality-link" onClick={onOpenVitality}>Vitalidad <ChevronRight size={18} aria-hidden="true" /></button>
      </div>
      <div className="balanced-companion-body">
        <div className="balanced-companion-frame">
          <PetSprite type={pet?.tipo || "gatoNaranja"} mood={estadoEmocional} energy={pet?.energia ?? 0} scale={2.4} embedded embeddedLeftPct={50} embeddedBottomPct={12} roam={0} step={0} />
        </div>
        <div className="balanced-companion-copy">
          <h2>{pet?.nombre || "Tu compañero"}</h2>
          <p>{petMood}</p>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ icon: Icon, name, description, color, onClick, delay = 0, metrics = [], personality, progressValue = null }) {
  const isAdventure = personality === "aventura";
  const primaryMetric = metrics?.[0]?.value || "Sin datos";
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.15, duration: 0.4 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="home-module-card home-navy-card w-full p-3 text-left transition-all hover:-translate-y-1"
      style={{
        '--life-card-accent': color
      }}
    >
      <div className="flex min-h-[175px] flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${isAdventure ? "adventure-icon-slot" : "rounded-full"}`} style={{ background: '#172033', border: `1px solid ${color}66` }}>
            {isAdventure ? <AdventureIcon type={name === "Finanzas" ? "finance" : name === "Negocio" ? "business" : "health"} size={28} color={color} /> : <Icon size={19} style={{ color }} strokeWidth={1.8} />}
          </div>
          {isAdventure ? <span className="font-pixel text-[#55637d]">›</span> : <ChevronRight size={18} className="mt-1 text-[#8d94a7]" />}
        </div>
        <div>
          <h3 className="m-0 text-[13px] font-medium text-[#8d94a7]">
            {name}
          </h3>
          <p className="home-module-exp m-0 mt-0.5 min-w-0 max-w-full whitespace-nowrap text-[27px] font-medium leading-none text-[#fbf9f6]" style={{ fontFamily: 'var(--font-editorial)' }}>
            {primaryMetric}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded bg-[#172033]"><div className="h-full" style={{ width: progressValue == null ? 0 : `${Math.min(100, Math.max(0, progressValue))}%`, background: color }} /></div>
          <p className="home-module-level m-0 mt-2 min-w-0 break-words text-[12px] text-[#8d94a7]">{metrics?.[1]?.label ? `${metrics[1].label}: ${metrics[1].value}` : description}</p>
        </div>
      </div>
    </motion.button>
  );
}

export default function HomeView({ personality = "equilibrado" }) {
  const { user, ui, data } = useDashboard();
  const { setActiveTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { setFinanceForm } = ui.forms;
  const { setHealthForm } = ui.forms;
  const balancedNow = new Date();
  const balancedName = user?.name || user?.displayName || user?.nombre || "Usuario";
  const userStats = data.userStats || {};
  // Pet real de Firestore (mismo doc que usa la pestaña Salud)
  const { pet, estadoEmocional } = usePet();

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
  const experienciaSiguienteNivel = Math.max(100, nivelMascota * 100);
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
    extatico: "Está radiante",
    feliz: "Está feliz contigo",
    normal: "Está esperando tu próxima acción",
    cansado: "Necesita un poco de energía",
    triste: "Necesita que lo cuides"
  }[estadoEmocional] || "Está contigo hoy";
  const balancedWeekDays = getBalancedWeekDays(data?.movimientos || [], data?.ventas || []);

  const habitos = data?.habitos || [];
  const habitosChecks = data?.saludHoy?.habitosChecks || [];
  const habitosCompletados = habitos.filter((habito) => habitosChecks.includes(habito.id)).length;
  const balancedSaludMetrics = habitos.length > 0
    ? [
      { label: "Hábitos hoy", value: `${habitosCompletados}/${habitos.length}` },
      { label: "Estado", value: petMood },
    ]
    : [
      { label: "Acciones hoy", value: dailyActions.toString() },
      { label: "Estado", value: petMood },
    ];

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

  const presupuestoGastado = (data?.presupuestos || []).reduce((sum, item) => sum + safeMonto(item?.gastado), 0);
  const presupuestoLimite = (data?.presupuestos || []).reduce((sum, item) => sum + safeMonto(item?.limite), 0);
  const financeProgress = presupuestoLimite > 0 ? (presupuestoGastado / presupuestoLimite) * 100 : null;

  const modules = [
    {
      id: "finanzas",
      icon: Wallet,
      name: "Finanzas",
      description: "Control de tu dinero y presupuestos",
      color: "#d4e846",
      metrics: finanzasMetrics,
      progressValue: financeProgress,
    },
    {
      id: "ventas",
      icon: Store,
      name: "Negocio",
      description: "Gestión de ventas y productos",
      color: "#e06853",
      metrics: negocioMetrics,
      progressValue: null,
    },
    {
      id: "salud",
      icon: Activity,
      name: "Salud",
      description: "Tu mascota y seguimiento de hábitos",
      color: "#5c8ed6",
      metrics: personality === "equilibrado" ? balancedSaludMetrics : saludMetrics,
      progressValue: saludMascota,
    },
  ];

  return (
    <div
      className={`home-view home-view--${personality} ${personality === "equilibrado" ? "home-equilibrado" : personality === "aventura" ? "home-aventura" : ""} space-y-4 ${personality === "equilibrado" || personality === "aventura" ? "pb-0" : "pb-24"}`}
    >
      {personality === "equilibrado" && (
        <>
          <header className="balanced-greeting">
            <p>{formatBalancedDate(balancedNow)}</p>
            <h1>{getBalancedGreeting(balancedNow.getHours())}, <em>{balancedName}</em></h1>
          </header>
          <BalancedCompanionCard
            pet={pet}
            estadoEmocional={estadoEmocional}
            petMood={petMood}
            onOpenVitality={() => setActiveTab("salud")}
          />
          <BalancedHero
            recommendation={dailyRecommendation}
            onAction={() => {
              if (dailyRecommendation.modal === "nutricion") {
                setHealthForm((current) => ({ ...current, foodName: "", foodQuantity: 1, foodCalories: "", tipoComida: "almuerzo" }));
                setModalOpen("nutricion");
              } else if (dailyRecommendation.modal === "agua") {
                setModalOpen("agua");
              } else if (dailyRecommendation.modal && setModalOpen) {
                setModalOpen(dailyRecommendation.modal);
              } else setActiveTab(dailyRecommendation.tab);
            }}
          />
        </>
      )}
      {personality !== "equilibrado" && <section className="home-companion-card home-navy-card overflow-hidden p-4">
        <div className="flex items-center gap-3">
          <div className={`relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden ${personality === "aventura" ? "rounded-lg border-2 border-[#161b2a] bg-[#7cb342] shadow-[inset_0_-3px_0_#558b2f]" : "rounded-[24px] bg-[var(--life-accent-soft)]"}`}>
            <PetSprite type={pet?.tipo || "gatoNaranja"} mood={estadoEmocional} energy={pet?.energia ?? 0} scale={personality === "aventura" ? 2 : 2.4} embedded embeddedLeftPct={50} embeddedBottomPct={12} roam={0} step={0} />
            {personality === "aventura" && <span className="absolute -right-1 -top-2 flex h-5 w-5 items-center justify-center border-2 border-[#161b2a] bg-white text-[#e63946] shadow-[1px_1px_0_#000]"><AdventureIcon type="heart" size={11} color="#e63946" /></span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[13px] uppercase tracking-[0.12em] text-[#8d94a7]">Compañero <span className="text-[#d4e846]">•</span></p>
                <p className="home-companion-title mt-1 truncate text-[28px] leading-none text-[#fbf9f6]">{personality === "aventura" ? "¡Listo para la aventura!" : "Vamos muy bien"}</p>
                <p className="home-muted mt-1 text-[11px]">{pet?.nombre || "Tu compañero"}</p>
              </div>
              <span className="rounded-full bg-[var(--life-accent-soft)] px-2 py-1 text-[10px] font-black text-[var(--life-accent)]">{personality === "aventura" ? "NIVEL" : "Nv."} {nivelMascota}</span>
            </div>
            <p className="home-muted mt-1 text-[14px]">Pequeños pasos, gran progreso.</p>
            <div className="mt-2 flex gap-2 text-[10px] font-bold text-[#8d94a7]">
              <span className="adventure-number inline-flex items-center gap-1"><Zap size={12} className="text-[#d4e846]" /> {pet?.energia ?? 0}</span>
              <span className="adventure-number inline-flex items-center gap-1"><Heart size={12} className="text-[#e06853]" /> {pet?.felicidad ?? 0}</span>
              <span className="adventure-number inline-flex items-center gap-1"><Star size={12} className="text-[#5c8ed6]" /> {pet?.experiencia ?? 0} XP</span>
            </div>
          </div>
          <div className={`${personality === "aventura" ? "flex w-20 flex-col items-end" : "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full"}`} style={personality === "aventura" ? undefined : { background: `conic-gradient(#d4e846 ${Math.max(8, saludMascota)}%, #2b3549 0)` }}>
            {personality === "aventura" ? <><span className="font-pixel text-[9px] text-[#63728e]">NIVEL</span><span className="font-pixel text-xl font-bold text-[#161b2a]">{nivelMascota}</span><div className="h-2.5 w-16 overflow-hidden border-2 border-[#161b2a] bg-[#0e1321]"><div className="h-full bg-[#7cb342]" style={{ width: `${Math.min(100, Math.max(8, saludMascota))}%` }} /></div><span className="font-pixel text-[8px] text-[#63728e]">{pet?.experiencia || 0}/{experienciaSiguienteNivel} XP</span></> : <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#151b2a] text-[18px] font-semibold text-[#fbf9f6]">{Math.max(0, saludMascota)}%</div>}
          </div>
        </div>
      </section>}

      <section className={`flex flex-col gap-2 ${personality === "equilibrado" ? "hidden" : ""}`}>
        <div className="flex items-center justify-between px-1">
          <h2 className="home-section-title m-0 text-[var(--life-text)]">Tu siguiente movimiento</h2>
          <span className="rounded-full bg-[rgba(22,27,42,0.95)] px-3 py-1 text-[12px] font-medium text-[#ccff00]">Prioritario</span>
        </div>
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
        className="home-next-action home-navy-card w-full p-4 text-left transition-colors hover:border-[var(--life-accent)]"
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center ${personality === "aventura" ? "rounded-lg border-2 border-[#161b2a] bg-[#fffdf7]" : "rounded-2xl bg-[var(--life-accent-soft)] text-2xl"}`}>{personality === "aventura" ? <AdventureFlag size={34} /> : dailyRecommendation.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="home-action-title mt-1 truncate text-[21px] font-semibold text-[#fbf9f6]">{dailyRecommendation.label}</p>
            <p className="home-muted mt-0.5 text-[14px]">{dailyRecommendation.detail}</p>
          </div>
          {personality === "aventura" ? <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#161b2a] bg-[#ccff00] text-3xl text-[#161b2a] shadow-[0_3px_0_#161b2a]">›</span> : <ChevronRight className="mt-1 shrink-0 text-[var(--life-accent)]" size={22} aria-hidden="true" />}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--life-surface-2)] px-3 py-2">
          <p className="home-muted text-[11px] font-bold">
            {`${pet?.nombre || "Tu mascota"} ${petMood.toLowerCase()}.`}
          </p>
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#d4e846]">Hacer ahora</span>
        </div>
      </LifeCard>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="home-section-title m-0 text-[var(--life-text)]">Tu progreso — 7 días</h2>
          <span className="text-[14px] text-[var(--life-text)]"><strong>{Math.min(7, weeklySummary.streak || 0)}</strong> / 7 días</span>
        </div>
        <div className="home-light-card balanced-week-grid grid grid-cols-7 gap-1.5 p-3">
          {balancedWeekDays.map((day) => {
            const complete = day.actions > 0;
            return <div key={`${day.label}-${day.date}`} className={`balanced-week-day flex min-w-0 flex-col items-center gap-2 text-[11px] text-[var(--life-text-dim)] ${day.isToday ? 'is-today' : ''}`}>
              <span className={day.isToday ? 'font-semibold text-[var(--life-text)]' : ''}>{day.label}</span>
              <span className={`balanced-week-mark flex h-7 w-full items-center justify-center rounded ${day.isToday ? 'is-today' : complete ? 'is-complete' : 'is-empty'}`}>
                {complete ? '✓' : day.isFuture ? '·' : '–'}
              </span>
              <strong>{day.date}</strong>
            </div>;
          })}
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
                ? `Hoy: ${dailyActions} ${dailyActions === 1 ? "avance" : "avances"} registrados.`
                : "Tu día está listo para empezar. Elige una acción pequeña.")}
        </p>
        <p className="mt-1 text-[11px] font-bold text-[var(--life-text-dim)]">{weeklySummary.actionDelta >= 0 ? `+${weeklySummary.actionDelta}` : weeklySummary.actionDelta} acciones frente a la semana pasada.</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--life-text-dim)]">{weeklySummary.insight}</p>
      </section>

      <section className="home-modules-grid mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="home-section-title m-0 text-[var(--life-text)]">Áreas principales</h2>
          <button type="button" className="flex items-center gap-1 text-[14px] text-[var(--life-text-dim)]" onClick={() => setActiveTab('finanzas')}>Ver todas <ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            delay={index}
            icon={module.icon}
            name={module.name}
            description={module.description}
            color={module.color}
            metrics={module.metrics}
            progressValue={module.progressValue}
            personality={personality}
            onClick={() => setActiveTab(module.id)}
          />
        ))}
        </div>
      </section>

      {/* Quick Access Buttons */}
      {setModalOpen && (
      <div className="home-quick-access mt-2 px-0 pt-2">
          <h2 className="home-section-title mb-2 px-1 text-[var(--life-text)]">Acceso rápido</h2>
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
              className="home-quick-action relative overflow-hidden p-2.5 text-center transition-all"
              style={{
                background: "var(--life-surface)"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center ${personality === "aventura" ? "adventure-icon-slot" : "rounded-xl"}`}
                  style={{ background: "#22c55e20" }}
                >
                  {personality === "aventura" ? <AdventureIcon type="income" size={30} color="#4cd964" /> : <ArrowDownRight size={18} style={{ color: "#22c55e" }} strokeWidth={1.8} />}
                </div>
                <span className="home-quick-label text-[9px] font-black text-[var(--life-text)]">
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
              className="home-quick-action relative overflow-hidden p-2.5 text-center transition-all"
              style={{
                background: "var(--life-surface)"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center ${personality === "aventura" ? "adventure-icon-slot" : "rounded-xl"}`}
                  style={{ background: "#ef444420" }}
                >
                  {personality === "aventura" ? <AdventureIcon type="expense" size={30} color="#ff3b30" /> : <ArrowUpRight size={18} style={{ color: "#ef4444" }} strokeWidth={1.8} />}
                </div>
                <span className="home-quick-label text-[9px] font-black text-[var(--life-text)]">
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
              className="home-quick-action relative overflow-hidden p-2.5 text-center transition-all"
              style={{
                background: "var(--life-surface)"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center ${personality === "aventura" ? "adventure-icon-slot" : "rounded-xl"}`}
                  style={{ background: "#f5972220" }}
                >
                  {personality === "aventura" ? <AdventureIcon type="sale" size={30} color="#ff9500" /> : <ShoppingCart size={18} style={{ color: "#f59722" }} strokeWidth={1.8} />}
                </div>
                <span className="home-quick-label text-[9px] font-black text-[var(--life-text)]">
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
              className="home-quick-action relative overflow-hidden p-2.5 text-center transition-all"
              style={{
                background: "var(--life-surface)"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center ${personality === "aventura" ? "adventure-icon-slot" : "rounded-xl"}`}
                  style={{ background: "#65a30d20" }}
                >
                  {personality === "aventura" ? <AdventureIcon type="food" size={30} color="#e63946" /> : <Apple size={18} style={{ color: "#65a30d" }} strokeWidth={1.8} />}
                </div>
                <span className="home-quick-label text-[9px] font-black text-[var(--life-text)]">
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
