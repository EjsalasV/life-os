"use client";

import { ArrowRight, HeartPulse, Store, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  { title: "Dinero claro", value: "$1,240", detail: "balance disponible", icon: Wallet, color: "#0284c7" },
  { title: "Negocio en marcha", value: "12 ventas", detail: "esta semana", icon: Store, color: "#d97706" },
  { title: "Mascota feliz", value: "Nivel 4", detail: "3 acciones hoy", icon: HeartPulse, color: "#65a30d" }
];

export default function DemoView({ onExit }) {
  return (
    <main className="min-h-dvh bg-[var(--life-bg)] px-5 py-8 text-[var(--life-text)]">
      <div className="mx-auto max-w-md space-y-5">
        <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">Life OS</p><p className="mt-1 text-xs font-bold text-[var(--life-text-dim)]">Vista de demostración</p></div><span className="rounded-full bg-[var(--life-accent-soft)] px-3 py-1 text-[10px] font-black uppercase text-[var(--life-accent)]">Demo</span></div>
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] bg-[var(--life-surface)] p-5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--life-text-muted)]">Ritual de hoy</p>
          <h1 className="mt-2 text-3xl font-black leading-tight">Registra una venta y cuida tu progreso.</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--life-text-dim)]">Life OS conecta tus decisiones de dinero, negocio y bienestar con una mascota que avanza contigo.</p>
          <div className="mt-4 rounded-2xl bg-[var(--life-surface-2)] p-3 text-xs font-bold text-[var(--life-text-dim)]">🐾 Tu mascota está lista para acompañarte.</div>
        </motion.section>
        <div className="grid gap-3">{cards.map(({ title, value, detail, icon: Icon, color }, index) => <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="flex items-center gap-3 rounded-[24px] bg-[var(--life-surface)] p-4 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${color}20`, color }}><Icon size={21} /></div><div className="min-w-0 flex-1"><p className="text-xs font-black">{title}</p><p className="mt-1 text-[11px] text-[var(--life-text-dim)]">{detail}</p></div><p className="text-sm font-black" style={{ color }}>{value}</p></motion.div>)}</div>
        <button type="button" onClick={onExit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--life-accent)] py-4 text-xs font-black uppercase tracking-widest text-black">Crear mi Life OS <ArrowRight size={16} /></button>
        <button type="button" onClick={onExit} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-[var(--life-text-muted)]">Volver a iniciar sesión</button>
      </div>
    </main>
  );
}
