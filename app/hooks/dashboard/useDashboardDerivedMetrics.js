"use client";

import { useMemo } from "react";
import { safeMonto, formatMoney, CATEGORIAS } from "@/app/utils/helpers";

export default function useDashboardDerivedMetrics({ movimientos, cuentas, fijos, presupuestos }) {
  const balanceMes = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === "INGRESO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    const gastos = movimientos
      .filter((m) => m.tipo === "GASTO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
      proyeccion:
        cuentas.reduce((acc, current) => acc + safeMonto(current.monto), 0) -
        fijos.reduce((acc, current) => acc + safeMonto(current.monto), 0)
    };
  }, [movimientos, cuentas, fijos]);

  const smartMessage = useMemo(() => {
    const gastoMensual = movimientos
      .filter((m) => m.tipo === "GASTO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    return gastoMensual === 0 ? "Sin gastos este mes." : `Movimiento mensual: ${formatMoney(gastoMensual)}`;
  }, [movimientos]);

  const presupuestoData = useMemo(() => {
    return CATEGORIAS.map((cat) => {
      const presupuesto = presupuestos.find((p) => p?.categoria === cat.id);
      const categoria = presupuesto?.categoria || cat.id;
      const limite = safeMonto(presupuesto?.limite);
      const gastado = movimientos
        .filter((m) => m.tipo === "GASTO" && m.categoria === cat.id)
        .reduce((acc, current) => acc + safeMonto(current.monto), 0);

      const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;
      const historial = presupuesto?.historial || [];

      return {
        ...cat,
        id: presupuesto?.id || cat.id,
        categoria,
        label: cat.label || "Sin categoría",
        limite,
        gastado,
        porcentaje,
        historial,
        alertas: presupuesto?.alertas || []
      };
    });
  }, [presupuestos, movimientos]);

  return {
    balanceMes,
    smartMessage,
    presupuestoData
  };
}
