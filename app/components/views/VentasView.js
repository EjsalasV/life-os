"use client";

import React from "react";
import useSalesViewModel from "@/modules/sales/hooks/useSalesViewModel";
import { useDashboard } from "@/context/dashboard";
import { formatMoney, safeMonto } from "@/app/utils/helpers";
import VentasTabs from "./ventas/VentasTabs";
import TerminalTabContent from "./ventas/TerminalTabContent";
import InventarioTabContent from "./ventas/InventarioTabContent";
import HistorialTabContent from "./ventas/HistorialTabContent";
import FloatingCart from "./ventas/FloatingCart";

export default function VentasView() {
  const { user, ui, data, actions } = useDashboard();

  const { ventasSubTab, setVentasSubTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { busquedaProd, setBusquedaProd } = ui.filters;
  const { carrito, setCarrito } = ui.commerce;
  const { setProductForm, setPosForm } = ui.forms;
  const { ventas, productos } = data;
  const { deleteItem, addToCart } = actions;

  const isPro = user?.plan === "pro";

  const vm = useSalesViewModel({
    ventas,
    productos,
    busquedaProd,
    safeMonto,
    carrito
  });

  return (
    <div className="space-y-6 overflow-x-hidden">
      <VentasTabs ventasSubTab={ventasSubTab} onTabChange={setVentasSubTab} />

      {/* Animación CSS (compositor): el cambio de tab no depende de rAF/JS,
          así funciona aunque la pestaña esté en segundo plano. */}
      <div key={ventasSubTab} className="w-full animate-fade-in-scale">
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
        </div>

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
