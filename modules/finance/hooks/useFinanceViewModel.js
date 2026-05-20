"use client";

import { useMemo } from "react";

const safeMonto = (m) => {
  if (!m) return 0;
  const n = parseFloat(m);
  return isNaN(n) ? 0 : n;
};

export default function useFinanceViewModel({
  cuentas,
  movimientos,
  presupuestoData,
  fijos,
  metas,
  selectedAccountId,
  getTime
}) {
  const totalCuentasBalance = useMemo(
    () => cuentas.reduce((acc, current) => acc + safeMonto(current.monto), 0),
    [cuentas]
  );

  const preparedBudgetData = useMemo(
    () => presupuestoData.map((cat) => {
      const porcentaje = cat.limite > 0 ? Math.min((cat.gastado / cat.limite) * 100, 100) : 0;
      const colorBarra = porcentaje >= 100 ? "bg-rose-500" : porcentaje > 80 ? "bg-amber-400" : "bg-emerald-400";
      return { ...cat, porcentaje, colorBarra };
    }),
    [presupuestoData]
  );

  const visibleMovimientos = useMemo(() => {
    return movimientos
      .filter((m) => selectedAccountId ? (m.cuentaId === selectedAccountId || m.cuentaDestinoId === selectedAccountId) : true)
      .sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp))
      .map((m) => {
        let amountPrefix = "";
        if (m.tipo === "INGRESO") amountPrefix = "+";
        if (m.tipo === "GASTO") amountPrefix = "-";

        const displayDate = m.timestamp
          ? new Date(getTime(m.timestamp)).toLocaleDateString("es-EC", { day: "numeric", month: "short" })
          : "";

        return { ...m, amountPrefix, displayDate };
      });
  }, [movimientos, selectedAccountId, getTime]);

  const totalFijosMensuales = useMemo(
    () => fijos.reduce((acc, current) => acc + safeMonto(current.monto), 0),
    [fijos]
  );

  const metasConProgreso = useMemo(
    () => metas.map((m) => ({
      ...m,
      progreso: m.montoObjetivo > 0 ? Math.min((m.montoActual / m.montoObjetivo) * 100, 100) : 0
    })),
    [metas]
  );

  return {
    totalCuentasBalance,
    preparedBudgetData,
    visibleMovimientos,
    hasMovimientos: movimientos.length > 0,
    totalFijosMensuales,
    metasConProgreso
  };
}
