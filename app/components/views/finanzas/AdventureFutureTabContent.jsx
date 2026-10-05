"use client";

import React from "react";
import PremiumLock from "../../ui/PremiumLock";
import { AdventureIcon } from "../../ui/AdventureIcons";

function SegmentedBar({ value, className = "" }) {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0));
  const segments = 10;

  return (
    <div className={`adventure-future-progress ${className}`} aria-label={`${percentage}% completado`}>
      {Array.from({ length: segments }, (_, index) => {
        const segmentStart = index * (100 / segments);
        const filled = percentage >= segmentStart + (100 / segments);
        const partial = !filled && percentage > segmentStart;
        return <span key={index} className={filled ? "is-filled" : partial ? "is-partial" : ""} />;
      })}
    </div>
  );
}

function AdventureFutureTabContent({
  isPro,
  fijos,
  metas,
  totalFijosMensuales,
  formatMoney,
  openFinanceModal,
  deleteItem,
  setSelectedMeta
}) {
  const totalObjetivo = metas.reduce((acc, item) => acc + (Number(item?.montoObjetivo) || 0), 0);
  const totalActual = metas.reduce((acc, item) => acc + (Number(item?.montoActual) || 0), 0);
  const progresoGlobal = totalObjetivo > 0 ? Math.min(100, Math.round((totalActual / totalObjetivo) * 100)) : 0;
  const pendienteTotal = Math.max(0, totalObjetivo - totalActual);

  const insight = progresoGlobal >= 70
    ? "Vas adelantado con tus metas."
    : progresoGlobal >= 40
      ? "Buen ritmo, manten constancia."
      : "Activa aportes semanales para acelerar tus metas.";

  const handlePrimarySavings = () => {
    const firstMeta = metas[0];
    if (!firstMeta) {
      openFinanceModal("meta");
      return;
    }

    setSelectedMeta(firstMeta);
    openFinanceModal("ahorroMeta", { metaId: firstMeta.id });
  };

  return (
    <PremiumLock isPro={isPro} text="Planificacion PRO">
      <div className="adventure-future">
        <section className="adventure-future-mission">
          <div className="adventure-future-mission-heading">
            <div className="adventure-future-icon-slot">
              <AdventureIcon type="finance" size={28} color="#ccff00" />
            </div>
            <div className="adventure-future-mission-title">
              <span className="adventure-future-label">Mision principal</span>
              <h2>Proyeccion de ahorro</h2>
            </div>
            <strong className="adventure-future-percent">{progresoGlobal}%</strong>
          </div>
          <div className="adventure-future-rule" />
          <p className="adventure-future-caption">Acumulado de tus metas activas</p>
          <p className="adventure-future-total">
            {formatMoney(totalActual)} <span>/ {formatMoney(totalObjetivo || 0)}</span>
          </p>
          <SegmentedBar value={progresoGlobal} />
          <div className="adventure-future-stat-grid">
            <div className="adventure-future-stat">
              <span>Acumulado</span>
              <strong>{formatMoney(totalActual)}</strong>
            </div>
            <div className="adventure-future-stat">
              <span>Objetivo</span>
              <strong>{formatMoney(totalObjetivo || 0)}</strong>
            </div>
            <div className="adventure-future-stat">
              <span>Faltan</span>
              <strong>{formatMoney(pendienteTotal)}</strong>
            </div>
          </div>
          <button type="button" className="adventure-future-primary" onClick={handlePrimarySavings}>
            <AdventureIcon type="plus" size={16} color="#161b2a" />
            Ahorrar ahora
          </button>
        </section>

        <section className="adventure-future-insight">
          <div className="adventure-future-icon-slot">
            <AdventureIcon type="star" size={24} color="#ccff00" />
          </div>
          <div>
            <h2>Consejo del sabio</h2>
            <p>{insight}</p>
          </div>
        </section>

        <section className="adventure-future-section">
          <div className="adventure-future-section-heading">
            <div className="adventure-future-heading-copy">
              <AdventureIcon type="calendar" size={18} color="#ffd700" />
              <h2>Pagos fijos del mes</h2>
            </div>
            <button type="button" className="adventure-future-secondary" onClick={() => openFinanceModal("fijo")}>
              + Nuevo fijo
            </button>
          </div>
          <div className="adventure-future-summary">
            <span><b>Gastos fijos</b> {formatMoney(totalFijosMensuales)}</span>
            <span><b>Registros</b> {fijos.length}</span>
          </div>
          <div className="adventure-future-list">
            {fijos.map((fijo) => (
              <article key={fijo.id} className="adventure-future-payment">
                <div className="adventure-future-icon-slot small">
                  <AdventureIcon type="calendar" size={16} color="#ccff00" />
                </div>
                <div className="adventure-future-payment-copy">
                  <strong>{fijo?.nombre || "Sin nombre"}</strong>
                  <span>Cobro dia {fijo?.diaCobro || "-"}</span>
                </div>
                <div className="adventure-future-payment-value">
                  <strong>{formatMoney(fijo?.monto || 0)}</strong>
                  <div className="adventure-future-actions">
                    <button type="button" onClick={() => openFinanceModal("fijo", {
                      id: fijo.id,
                      nombre: fijo.nombre || "",
                      monto: String(fijo.monto ?? ""),
                      periodicidad: fijo.periodicidad || "Mensual",
                      diaCobro: String(fijo.diaCobro || "1"),
                      cuentaId: fijo.cuentaId || ""
                    })}>Editar</button>
                    <button type="button" onClick={() => deleteItem("fijos", fijo)}>Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
            {fijos.length === 0 && <div className="adventure-future-empty">Aun no tienes gastos fijos.</div>}
          </div>
        </section>

        <section className="adventure-future-section adventure-future-goals-section">
          <div className="adventure-future-section-heading">
            <div className="adventure-future-heading-copy">
              <AdventureIcon type="target" size={18} color="#ccff00" />
              <h2>Metas activas de ahorro</h2>
            </div>
            <span className="adventure-future-count">{metas.length} activas</span>
          </div>
          <div className="adventure-future-goals">
            {metas.map((meta) => {
              const progress = Math.min(100, Math.max(0, Number(meta?.progreso) || 0));
              return (
                <article key={meta.id} className="adventure-future-goal">
                  <div className="adventure-future-goal-heading">
                    <div className="adventure-future-goal-name">
                      <div className="adventure-future-icon-slot small">
                        <AdventureIcon type="target" size={16} color="#ccff00" />
                      </div>
                      <h3>{meta?.nombre || "Meta"}</h3>
                    </div>
                    <span className="adventure-future-badge">{progress}%</span>
                  </div>
                  <div className="adventure-future-goal-values">
                    <strong>{formatMoney(meta?.montoActual || 0)}</strong>
                    <span>Meta: {formatMoney(meta?.montoObjetivo || 0)}</span>
                  </div>
                  <SegmentedBar value={progress} />
                  <div className="adventure-future-goal-footer">
                    <span>{formatMoney(meta?.montoActual || 0)} acumulado</span>
                    <div className="adventure-future-actions">
                      <button type="button" onClick={() => openFinanceModal("meta", {
                        id: meta.id,
                        nombre: meta.nombre || "",
                        monto: String(meta.montoObjetivo ?? "")
                      })}>Editar</button>
                      <button type="button" onClick={() => deleteItem("metas", meta)}>Eliminar</button>
                    </div>
                  </div>
                  <button type="button" className="adventure-future-save" onClick={() => {
                    setSelectedMeta(meta);
                    openFinanceModal("ahorroMeta", { metaId: meta.id });
                  }}>
                    Aportar a meta
                  </button>
                </article>
              );
            })}
            {metas.length === 0 && <div className="adventure-future-empty">Crea tu primera meta para empezar a proyectar.</div>}
          </div>
        </section>

        <button type="button" className="adventure-future-new-goal" onClick={() => openFinanceModal("meta")}>
          + Crear nueva meta
        </button>
      </div>
    </PremiumLock>
  );
}

export default AdventureFutureTabContent;
