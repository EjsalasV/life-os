import React, { useState } from "react";
import { ChevronUp, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AdventureFloatingCart({ carrito, carritoItems, carritoTotal, setCarrito, setPosForm, setModalOpen, formatMoney }) {
  const [showCartList, setShowCartList] = useState(false);

  return (
    <AnimatePresence>
      {carrito.length > 0 && (
        <motion.section
          initial={{ y: 90, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 90, x: "-50%", opacity: 0 }}
          className="adventure-cart-dock"
          aria-label="Carrito de ventas"
        >
          <div className="adventure-cart-summary">
            <button type="button" className="adventure-cart-toggle" onClick={() => setShowCartList((value) => !value)} aria-expanded={showCartList}>
              <span className="adventure-cart-count">CARRITO: {carritoItems.reduce((sum, item) => sum + item.cantidad, 0)}</span>
              <span className="adventure-cart-total">{formatMoney(carritoTotal)}</span>
              <ChevronUp className={showCartList ? "rotate-180" : ""} size={18} aria-hidden="true" />
            </button>
            <button type="button" className="adventure-cart-clear" onClick={() => setCarrito([])} aria-label="Vaciar carrito"><X size={18} /></button>
            <button type="button" className="adventure-cart-checkout" onClick={() => { setPosForm({ cliente: "", cuentaId: "", id: null }); setModalOpen("cobrar"); }}>
              COBRAR <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
          {showCartList && (
            <div className="adventure-cart-items">
              {carritoItems.map((item, index) => (
                <div className="adventure-cart-item" key={`${item.id}-${index}`}>
                  <span>{item.cantidad}x {item.nombre}</span>
                  <strong>{formatMoney(item.subtotal)}</strong>
                  <button type="button" onClick={() => setCarrito(carrito.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Quitar ${item.nombre}`}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
