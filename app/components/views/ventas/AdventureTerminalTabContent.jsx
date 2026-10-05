import React from "react";
import { PackageOpen } from "lucide-react";
import { motion } from "framer-motion";
import PremiumLock from "../../ui/PremiumLock";
import { AdventureIcon } from "../../ui/AdventureIcons";

function money(value, formatMoney) {
  return formatMoney(value);
}

function cartQuantity(items, productId) {
  return items.find((item) => item.id === productId)?.cantidad || 0;
}

export default function AdventureTerminalTabContent({
  isPro,
  metricaUtilidad,
  metricaVenta,
  metricaCosto,
  ventasHoyCount,
  formatMoney,
  productosDisponibles,
  carritoItems,
  addToCart
}) {
  return (
    <div className="adventure-business-terminal space-y-5 pb-20">
      <section className="adventure-sales-stats" aria-label="Resultado de hoy">
        <div className="adventure-section-kicker">RESULTADO DE HOY <span>{ventasHoyCount} {ventasHoyCount === 1 ? "TICKET" : "TICKETS"}</span></div>
        <div className="adventure-sales-stat-grid">
          <div className="adventure-sales-stat adventure-sales-stat--sales">
            <span>VENTAS</span>
            <strong>{money(metricaVenta, formatMoney)}</strong>
          </div>
          <div className="adventure-sales-stat adventure-sales-stat--costs">
            <span>COSTOS</span>
            <PremiumLock isPro={isPro} text="SÓLO PRO"><strong>{money(metricaCosto, formatMoney)}</strong></PremiumLock>
          </div>
          <div className="adventure-sales-stat adventure-sales-stat--profit">
            <span>UTILIDAD</span>
            <PremiumLock isPro={isPro} text="VER UTILIDAD"><strong>{money(metricaUtilidad, formatMoney)}</strong></PremiumLock>
          </div>
        </div>
      </section>

      <section className="adventure-product-catalog" aria-labelledby="adventure-products-title">
        <div className="adventure-products-heading">
          <div>
            <p className="adventure-section-kicker" id="adventure-products-title">PRODUCTOS DISPONIBLES</p>
            <p className="adventure-products-count">{productosDisponibles.length} EN INVENTARIO</p>
          </div>
          <AdventureIcon type="business" size={30} color="#FF9800" />
        </div>

        {productosDisponibles.length === 0 ? (
          <div className="adventure-empty-products">
            <PackageOpen size={30} aria-hidden="true" />
            <strong>CREA TU PRIMER PRODUCTO</strong>
            <span>Después podrás añadirlo al carrito y registrar tu primera venta.</span>
          </div>
        ) : (
          <div className="adventure-product-grid">
            {productosDisponibles.map((product) => {
              const quantity = cartQuantity(carritoItems, product.id);
              const lowStock = product.stock <= 5;
              return (
                <motion.button
                  key={product.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(product)}
                  className={`adventure-product-slot ${quantity ? "is-in-cart" : ""}`}
                  aria-label={`Añadir ${product.nombre}, ${product.stock} disponibles, ${money(product.precioVenta, formatMoney)}`}
                >
                  <div className="adventure-product-topline">
                    <span className={`adventure-stock-badge ${lowStock ? "is-low" : ""}`}>
                      {lowStock ? "¡STOCK BAJO!" : `${product.stock} EN STOCK`}
                    </span>
                    {quantity > 0 && <span className="adventure-cart-badge">{quantity} EN CARRO</span>}
                  </div>
                  <div className="adventure-product-icon-slot"><AdventureIcon type="business" size={34} color="#FF9800" /></div>
                  <strong className="adventure-product-name">{product.nombre}</strong>
                  <span className="adventure-product-price">{money(product.precioVenta, formatMoney)}</span>
                  <span className="adventure-add-label">+ AÑADIR</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
