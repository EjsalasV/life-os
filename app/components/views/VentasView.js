"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSalesViewModel from "@/modules/sales/hooks/useSalesViewModel";
import VentasTabs from "./ventas/VentasTabs";
import TerminalTabContent from "./ventas/TerminalTabContent";
import InventarioTabContent from "./ventas/InventarioTabContent";
import HistorialTabContent from "./ventas/HistorialTabContent";
import FloatingCart from "./ventas/FloatingCart";

export default function VentasView({
  ventasSubTab, setVentasSubTab, ventas, formatMoney, safeMonto,
  deleteItem, productos, busquedaProd, setBusquedaProd,
  addToCart, setModalOpen, carrito, setCarrito, handleGenerarPedido,
  setProductForm, setPosForm, user
}) {
  const isPro = user?.plan === "pro";
  const tabsOrder = ["terminal", "inventario", "historial"];
  const [direction, setDirection] = useState(0);

  const vm = useSalesViewModel({
    ventas,
    productos,
    busquedaProd,
    safeMonto,
    carrito
  });

  const handleTabChange = (newTab) => {
    const oldIndex = tabsOrder.indexOf(ventasSubTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setVentasSubTab(newTab);
  };

  const tabVariants = {
    initial: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <VentasTabs ventasSubTab={ventasSubTab} onTabChange={handleTabChange} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={ventasSubTab} custom={direction} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="w-full">
          {ventasSubTab === "terminal" && (
            <TerminalTabContent
              isPro={isPro}
              metricaUtilidad={vm.metricaUtilidad}
              metricaVenta={vm.metricaVenta}
              metricaCosto={vm.metricaCosto}
              formatMoney={formatMoney}
              productosDisponibles={vm.productosDisponibles}
              addToCart={addToCart}
            />
          )}

          {ventasSubTab === "inventario" && (
            <InventarioTabContent
              isPro={isPro}
              busquedaProd={busquedaProd}
              setBusquedaProd={setBusquedaProd}
              setProductForm={setProductForm}
              setModalOpen={setModalOpen}
              handleGenerarPedido={handleGenerarPedido}
              productosFiltrados={vm.productosFiltrados}
              deleteItem={deleteItem}
              formatMoney={formatMoney}
            />
          )}

          {ventasSubTab === "historial" && (
            <HistorialTabContent
              ventas={ventas}
              hasVentas={vm.hasVentas}
              isPro={isPro}
              setPosForm={setPosForm}
              setModalOpen={setModalOpen}
              deleteItem={deleteItem}
              formatMoney={formatMoney}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <FloatingCart
        carrito={carrito}
        carritoItems={vm.carritoItems}
        carritoTotal={vm.carritoTotal}
        setCarrito={setCarrito}
        setPosForm={setPosForm}
        setModalOpen={setModalOpen}
        formatMoney={formatMoney}
      />
    </div>
  );
}
