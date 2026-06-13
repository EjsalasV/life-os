"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Store, Activity, ArrowDownRight, ArrowUpRight, ShoppingCart, Apple } from "lucide-react";
import { getTime, safeMonto, formatMoney } from "@/app/utils/helpers";
import { usePet } from "@/app/hooks/usePet";
import { useDashboard } from "@/context/dashboard";

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

export default function HomeView() {
  const { user, ui, data } = useDashboard();
  const { setActiveTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { setFinanceForm } = ui.forms;
  const userStats = data.userStats || {};
  // Pet real de Firestore (mismo doc que usa la pestaña Salud)
  const { pet } = usePet();

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
        <h2 className="m-0 text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--life-text)]">
          {saludo}
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

      {/* Quick Access Buttons */}
      {setModalOpen && (
        <div className="px-0 mt-8 pt-8 border-t border-[var(--life-border-soft)]">
          <p className="text-[10px] font-black uppercase text-[var(--life-text-muted)] mb-4 px-2">
            Acceso Rápido
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Ingreso Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * 0.45 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (setFinanceForm) {
                  setFinanceForm({ tipo: "INGRESO", nombre: "", monto: "" });
                }
                setModalOpen("movimiento");
              }}
              className="relative overflow-hidden rounded-[28px] border p-4 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #22c55e11, #22c55e06)",
                borderColor: "#22c55e44",
                boxShadow: "#22c55e22 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#22c55e20" }}
                >
                  <ArrowDownRight size={24} style={{ color: "#22c55e" }} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-black text-[var(--life-text)]">
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
                  setFinanceForm({ tipo: "GASTO", nombre: "", monto: "" });
                }
                setModalOpen("movimiento");
              }}
              className="relative overflow-hidden rounded-[28px] border p-4 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #ef444411, #ef444406)",
                borderColor: "#ef444444",
                boxShadow: "#ef444422 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#ef444420" }}
                >
                  <ArrowUpRight size={24} style={{ color: "#ef4444" }} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-black text-[var(--life-text)]">
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
              className="relative overflow-hidden rounded-[28px] border p-4 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #f5972211, #f5972206)",
                borderColor: "#f5972244",
                boxShadow: "#f5972222 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#f5972220" }}
                >
                  <ShoppingCart size={24} style={{ color: "#f59722" }} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-black text-[var(--life-text)]">
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
              onClick={() => setModalOpen("nutricion")}
              className="relative overflow-hidden rounded-[28px] border p-4 text-center transition-all"
              style={{
                background: "linear-gradient(135deg, #65a30d11, #65a30d06)",
                borderColor: "#65a30d44",
                boxShadow: "#65a30d22 0px 0px 30px"
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#65a30d20" }}
                >
                  <Apple size={24} style={{ color: "#65a30d" }} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-black text-[var(--life-text)]">
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
