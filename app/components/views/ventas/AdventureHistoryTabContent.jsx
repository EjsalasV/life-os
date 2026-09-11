import React from "react";
import { Edit3, Lock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { AdventureIcon } from "../../ui/AdventureIcons";

function formatSaleDate(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : timestamp instanceof Date ? timestamp : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function saleItems(venta) {
  return Array.isArray(venta.items) ? venta.items : [];
}

export default function AdventureHistoryTabContent({ ventas, hasVentas, isPro, setPosForm, setModalOpen, deleteItem, formatMoney }) {
  if (!hasVentas) {
    return (
      <div className="adventure-history-empty">
        <div className="adventure-history-empty-icon"><AdventureIcon type="calendar" size={34} color="#FF9800" /></div>
        <strong>AÚN NO HAY VENTAS REGISTRADAS</strong>
        <span>Cuando registres un cobro, tus tickets aparecerán aquí.</span>
      </div>
    );
  }

  return (
    <div className="adventure-business-history space-y-4 pb-16">
      {ventas.map((venta) => {
        const dateLabel = formatSaleDate(venta.timestamp);
        const cancelled = Boolean(venta.anulada || venta.estado === "anulada");
        return (
          <motion.article key={venta.id} layout className={`adventure-ticket ${cancelled ? "is-cancelled" : ""}`}>
            <div className="adventure-ticket-header">
              <div className="adventure-ticket-heading">
                <div className="adventure-ticket-icon"><AdventureIcon type="sale" size={26} color="#FF9800" /></div>
                <div>
                  <p className="adventure-ticket-label">TICKET</p>
                  <h2>#{venta.reciboId || venta.id}</h2>
                </div>
              </div>
              {cancelled && <span className="adventure-ticket-status">ANULADA</span>}
            </div>

            <div className="adventure-ticket-meta">
              <div><span>CLIENTE</span><strong>{venta.cliente || "Consumidor Final"}</strong></div>
              {dateLabel && <div><span>FECHA</span><strong>{dateLabel}</strong></div>}
            </div>

            <div className="adventure-ticket-items">
              <p>PRODUCTOS</p>
              {saleItems(venta).length > 0 ? saleItems(venta).map((item, index) => (
                <div className="adventure-ticket-item" key={`${item.id || item.nombre}-${index}`}>
                  <span>{item.cantidad}x {item.nombre || "Producto"}</span>
                  <strong>{formatMoney(item.subtotal ?? item.precioUnitario * item.cantidad)}</strong>
                </div>
              )) : <span className="adventure-ticket-no-items">Detalle no disponible</span>}
            </div>

            <div className="adventure-ticket-total">
              <span>TOTAL</span>
              <strong>{formatMoney(venta.total)}</strong>
            </div>

            <div className="adventure-ticket-actions">
              <button
                type="button"
                disabled={!isPro || cancelled}
                aria-label={`Editar ticket ${venta.reciboId || venta.id}`}
                onClick={() => {
                  if (isPro && !cancelled) {
                    setPosForm({ ...venta, id: venta.id });
                    setModalOpen("cobrar");
                  }
                }}
                className="adventure-ticket-edit"
              >
                {isPro && !cancelled ? <Edit3 size={14} /> : <Lock size={13} />}
                {isPro && !cancelled ? "EDITAR TICKET" : "EDICIÓN PRO"}
              </button>
              <button
                type="button"
                disabled={!isPro || cancelled}
                onClick={() => {
                  if (isPro && !cancelled && window.confirm("¿Anular esta venta?")) deleteItem("ventas", venta);
                }}
                className="adventure-ticket-cancel"
              >
                <Trash2 size={14} />
                {cancelled ? "ANULADA" : isPro ? "ANULAR" : "ANULACIÓN PRO"}
              </button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
