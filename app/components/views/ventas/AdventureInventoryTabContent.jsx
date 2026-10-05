import React from "react";
import { Edit3, Lock, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import PremiumLock from "../../ui/PremiumLock";
import { AdventureIcon } from "../../ui/AdventureIcons";

function stockState(stock) {
  if (stock <= 0) return { label: "SIN STOCK", className: "is-empty" };
  if (stock <= 5) return { label: "STOCK BAJO", className: "is-low" };
  return { label: "STOCK OK", className: "is-ok" };
}

export default function AdventureInventoryTabContent({
  isPro,
  busquedaProd,
  setBusquedaProd,
  setProductForm,
  setModalOpen,
  productosFiltrados,
  deleteItem,
  formatMoney
}) {
  const openNewProduct = () => {
    setProductForm({ nombre: "", precioVenta: "", costo: "", stock: "" });
    setModalOpen("producto");
  };

  const openEditProduct = (product) => {
    if (!isPro) return;
    setProductForm({
      ...product,
      originalStock: product.stock,
      precioVenta: String(product.precioVenta),
      costo: String(product.costo),
      stock: String(product.stock)
    });
    setModalOpen("producto");
  };

  return (
    <div className="adventure-business-inventory space-y-5 pb-16">
      <div className="adventure-inventory-toolbar">
        <label className="adventure-inventory-search">
          <span className="sr-only">Buscar producto</span>
          <AdventureIcon type="search" size={19} color="#536070" />
          <input
            type="search"
            placeholder="BUSCAR PRODUCTO"
            value={busquedaProd}
            onChange={(event) => setBusquedaProd(event.target.value)}
          />
        </label>
        <button type="button" className="adventure-new-product" onClick={openNewProduct}>
          <Plus size={18} aria-hidden="true" />
          <span>+ NUEVO PRODUCTO</span>
        </button>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="adventure-inventory-empty">
          <div className="adventure-empty-icon"><AdventureIcon type="business" size={34} color="#FF9800" /></div>
          <strong>{busquedaProd ? "NO HAY COINCIDENCIAS" : "INVENTARIO VACÍO"}</strong>
          <span>{busquedaProd ? "Prueba con otro nombre de producto." : "Crea tu primer producto para comenzar a vender."}</span>
          {!busquedaProd && <button type="button" className="adventure-empty-cta" onClick={openNewProduct}>+ CREAR PRODUCTO</button>}
        </div>
      ) : (
        <div className="adventure-inventory-grid">
          {productosFiltrados.map((product) => {
            const state = stockState(product.stock);
            return (
              <motion.article
                key={product.id}
                layout
                whileTap={isPro ? { scale: 0.985 } : undefined}
                className="adventure-inventory-card"
              >
                <div className="adventure-inventory-card-top">
                  <span className={`adventure-inventory-stock ${state.className}`}>{state.label}</span>
                  <span className="adventure-inventory-stock-value">{product.stock} UNI</span>
                </div>
                <div className="adventure-inventory-card-main">
                  <div className="adventure-inventory-icon-slot"><AdventureIcon type="business" size={36} color="#FF9800" /></div>
                  <div className="adventure-inventory-name-wrap">
                    <strong>{product.nombre}</strong>
                    {!isPro && <span className="adventure-inventory-locked"><Lock size={11} /> EDICIÓN PRO</span>}
                  </div>
                </div>
                <div className="adventure-inventory-values">
                  <div><span>COSTO</span><strong>{formatMoney(product.costo)}</strong></div>
                  <div><span>PRECIO</span><strong className="is-sale">{formatMoney(product.precioVenta)}</strong></div>
                  <PremiumLock isPro={isPro} text="ANÁLISIS PRO">
                    <div className="adventure-inventory-profit"><span>UTILIDAD</span><strong>{formatMoney(product.utilidad)}</strong></div>
                  </PremiumLock>
                </div>
                <div className="adventure-inventory-actions">
                  <button type="button" disabled={!isPro} onClick={() => openEditProduct(product)} className="adventure-inventory-edit">
                    {isPro ? <Edit3 size={14} /> : <Lock size={13} />} EDITAR
                  </button>
                  <button type="button" onClick={() => deleteItem("productos", product)} className="adventure-inventory-delete" aria-label={`Eliminar ${product.nombre}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
