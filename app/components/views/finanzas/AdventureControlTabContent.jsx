"use client";

import React from "react";
import { Pencil, Plus } from "lucide-react";
import { AdventureIcon } from "@/app/components/ui/AdventureIcons";
import usePresupuestoAlertasGranulares from "../../../hooks/usePresupuestoAlertasGranulares";
import usePresupuestoHistorySync from "../../../hooks/usePresupuestoHistorySync";

function getCategoryIcon(label = "") {
  const value = label.toLowerCase();
  if (value.includes("aliment") || value.includes("comida")) return "food";
  if (value.includes("salud")) return "health";
  if (value.includes("transporte")) return "business";
  if (value.includes("hogar") || value.includes("vivienda")) return "home";
  if (value.includes("educ")) return "star";
  return "finance";
}

function getStatus(porcentaje) {
  if (porcentaje >= 100) return { label: "Limite superado", color: "#ff3b30" };
  if (porcentaje >= 85) return { label: "Cerca del limite", color: "#ff9500" };
  return { label: "Uso saludable", color: "#4cd964" };
}

function SegmentedProgress({ value, color = "#ccff00" }) {
  const filled = Math.ceil(Math.min(100, Math.max(0, value)) / 10);
  return (
    <div className="adventure-segmented-progress" aria-label={`${Math.round(value)}% completado`}>
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} style={{ backgroundColor: index < filled ? color : "#1a2130" }} />
      ))}
    </div>
  );
}

function StatBox({ label, value, detail, color }) {
  return (
    <div className="adventure-control-stat">
      <div className="adventure-control-stat-heading">
        <span>{label}</span>
        <AdventureIcon type={label === "Ingresos" ? "income" : "expense"} size={18} color={color} />
      </div>
      <strong style={{ color }}>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export default function AdventureControlTabContent({
  smartMessage,
  userStats,
  handleNoSpendToday,
  balanceMes,
  formatMoney,
  presupuestoData,
  setSelectedBudgetCat,
  openFinanceModal,
  movimientos,
  showToast,
  user
}) {
  usePresupuestoAlertasGranulares(presupuestoData, showToast);
  usePresupuestoHistorySync(presupuestoData, movimientos, user);

  const gastoTotal = presupuestoData.reduce((acc, item) => acc + (Number(item?.gastado) || 0), 0);
  const limiteTotal = presupuestoData.reduce((acc, item) => acc + (Number(item?.limite) || 0), 0);
  const porcentajeTotal = limiteTotal > 0 ? Math.round((gastoTotal / limiteTotal) * 100) : 0;
  const restante = Math.max(0, limiteTotal - gastoTotal);
  const now = new Date();
  const totalDiasMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(0, totalDiasMes - now.getDate());
  const streak = typeof userStats?.currentStreak === "number" ? userStats.currentStreak : 0;

  const handleEditPresupuesto = (cat) => {
    setSelectedBudgetCat(cat);
    openFinanceModal("presupuesto", {
      id: cat?.presupuestoId || null,
      categoria: cat?.categoria || cat?.id,
      limite: cat?.limite > 0 ? cat.limite : ""
    });
  };

  return (
    <div className="adventure-control space-y-4">
      <section className="adventure-budget-panel">
        <div className="adventure-panel-heading">
          <div className="adventure-icon-slot"><AdventureIcon type="finance" size={20} color="#ffb74d" /></div>
          <h2>Presupuesto del mes</h2>
        </div>
        <div className="adventure-budget-values">
          <strong>{formatMoney(gastoTotal)}</strong>
          <span>/ {formatMoney(limiteTotal || 0)}</span>
        </div>
        <p className="adventure-body-copy">Gasto controlado según tu plan de expedición.</p>
        <SegmentedProgress value={porcentajeTotal} />
        <div className="adventure-budget-footer">
          <strong>Disponible: {formatMoney(restante)}</strong>
          <span>{diasRestantes} días restantes</span>
        </div>
      </section>

      <button type="button" className="adventure-streak-panel" onClick={handleNoSpendToday}>
        <span className="adventure-icon-slot"><AdventureIcon type="health" size={22} color="#4a90e2" /></span>
        <span>
          <strong>Racha sin gasto: {streak} día{streak === 1 ? "" : "s"}</strong>
          <small>¡Mantén la disciplina para seguir avanzando!</small>
        </span>
      </button>

      <div className="adventure-control-stats">
        <StatBox
          label="Ingresos"
          value={`+${formatMoney(balanceMes?.ingresos || 0)}`}
          detail="Registrado este mes"
          color="#4cd964"
        />
        <StatBox
          label="Gastos"
          value={`-${formatMoney(balanceMes?.gastos || 0)}`}
          detail={`${porcentajeTotal}% del presupuesto`}
          color="#ff3b30"
        />
      </div>

      <div className="adventure-net-badge">
        <span>Balance neto actual:</span>
        <strong>{formatMoney(balanceMes?.proyeccion || 0)}</strong>
      </div>

      <section className="adventure-assistant-panel">
        <div className="adventure-icon-slot"><AdventureIcon type="star" size={20} color="#ccff00" /></div>
        <div>
          <div className="adventure-section-label"><strong>Asistente</strong><span>▸ Mensaje</span></div>
          <p>{smartMessage || "Sin novedades por ahora."}</p>
        </div>
      </section>

      <section className="adventure-category-section">
        <div className="adventure-section-header">
          <h2><AdventureIcon type="finance" size={18} color="#ccff00" /> Categorías de gasto</h2>
          <button type="button" className="adventure-secondary-button" onClick={() => openFinanceModal("presupuesto")}>
            Ajustar
          </button>
        </div>

        <div className="adventure-category-list">
          {presupuestoData.map((cat) => {
            const porcentaje = Number.isFinite(cat?.porcentaje) ? cat.porcentaje : 0;
            const status = getStatus(porcentaje);
            const label = cat?.label || cat?.categoria || "Sin categoria";
            return (
              <article key={cat?.id || cat?.categoria} className="adventure-category-card">
                <div className="adventure-category-heading">
                  <div className="adventure-icon-slot"><AdventureIcon type={getCategoryIcon(label)} size={20} color={cat?.hex || "#ccff00"} /></div>
                  <div>
                    <h3>{label}</h3>
                    <p>{formatMoney(cat?.gastado || 0)} / {cat?.limite > 0 ? formatMoney(cat.limite) : "sin límite"}</p>
                  </div>
                  <button type="button" aria-label={`Editar presupuesto de ${label}`} onClick={() => handleEditPresupuesto(cat)}>
                    <Pencil size={14} />
                  </button>
                </div>
                <SegmentedProgress value={porcentaje} color={porcentaje >= 100 ? "#ff3b30" : porcentaje >= 85 ? "#ff9500" : cat?.hex || "#ccff00"} />
                <div className="adventure-category-footer">
                  <span>{porcentaje}%</span>
                  <span style={{ color: status.color }}>{status.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <button type="button" className="adventure-primary-button" onClick={() => openFinanceModal("movimiento", { tipo: "GASTO" })}>
        <Plus size={20} /> + Registrar gasto
      </button>
    </div>
  );
}
