"use client";

import { useMemo } from "react";

export default function useSalesViewModel({ ventas, productos, busquedaProd, safeMonto, carrito }) {
  const ventasHoy = useMemo(
    () => ventas.filter((v) => {
      const d = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
      return d.toDateString() === new Date().toDateString();
    }),
    [ventas]
  );

  const metricaVenta = useMemo(
    () => ventasHoy.reduce((acc, current) => acc + safeMonto(current.total), 0),
    [ventasHoy, safeMonto]
  );

  const metricaCosto = useMemo(
    () => ventasHoy.reduce((acc, current) => acc + (current.costoTotal || 0), 0),
    [ventasHoy]
  );

  const metricaUtilidad = useMemo(
    () => metricaVenta - metricaCosto,
    [metricaVenta, metricaCosto]
  );

  const productosFiltrados = useMemo(
    () => productos
      .filter((p) => p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()))
      .map((p) => ({ ...p, utilidad: p.precioVenta - p.costo })),
    [productos, busquedaProd]
  );

  const productosDisponibles = useMemo(
    () => productos.filter((p) => p.stock > 0),
    [productos]
  );

  const carritoItems = useMemo(
    () => carrito.map((item) => ({ ...item, subtotal: item.precioVenta * item.cantidad })),
    [carrito]
  );

  const carritoTotal = useMemo(
    () => carritoItems.reduce((acc, current) => acc + current.subtotal, 0),
    [carritoItems]
  );

  return {
    ventasHoy,
    metricaVenta,
    metricaCosto,
    metricaUtilidad,
    productosFiltrados,
    productosDisponibles,
    carritoItems,
    carritoTotal,
    hasVentas: ventas.length > 0
  };
}
